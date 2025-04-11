import { InstructionDetail, LibFileDetail, StateDetail } from '@/interfaces/fileDetailInterfaces';

export const getModRsTemplate = (instructions: string[], additionalContext?: string): string => {
    const imports = instructions.map((name) => `pub mod ${name};`).join('\n');
    const exports = instructions.map((name) => `pub use ${name}::*;`).join('\n');
  
    return [
      additionalContext ? `// ${additionalContext}` : '',
      exports,
      '',
      imports
    ].filter(Boolean).join('\n');
};

export function getInstructionTemplate(
  details: InstructionDetail,
  _functionLogic: string = '// AI_FUNCTION_LOGIC',
  hasState: boolean = false
): string {
  const docComment = details.doc_description
    ? `#[doc = r"${details.doc_description}"]`
    : '';

  const instructionName = details.name;
  const contextStructName = details.context_name;
  const paramsStructName = details.params_name;
  const errorEnumName = details.error_enum_name ?? 'DefaultErrorName';

  const parsedImports = (details.imports || [])
    .map(({ module, items }: { module: string, items: string[] }) => {
      if (items.length === 1 && items[0] === '*') {
        return `use ${module}::*;`;
      }
      return `use ${module}::{${items.join(', ')}};`;
    })
    .join('\n');

  const stateImport = hasState ? 'use crate::state::*;' : '';

  const accountsStruct = (details.accounts || [])
    .map(({ name, type, constraints }) => {
      const accountConstraints = constraints?.length
        ? `#[account(${constraints.join(', ')})]\n`
        : '';

      if (type === 'Account') {
        return `${accountConstraints}    pub ${name.snake}: Account<'info, ${name.pascal}>,`;
      }
      if (type === 'Signer') {
        return `${accountConstraints}    pub ${name.snake}: Signer<'info>,`;
      }
      if (type === 'Program') {
        return `${accountConstraints}    pub ${name.snake}: Program<'info, System>,`;
      }
      if (type === 'Sysvar') {
        return `${accountConstraints}    pub ${name.snake}: Sysvar<'info, Rent>,`;
      }

      return `${accountConstraints}    pub ${name.snake}: ${type},`;
    })
    .join('\n');

  const paramsStruct = (details.params || [])
    .map(({ name, type }) => `    pub ${name}: ${type},`)
    .join('\n');

  const eventsStruct = (details.events || [])
    .map(event => `
#[event]
pub struct ${event.name} {
    ${event.fields
      .map(field => `pub ${field.name}: ${field.type},`)
      .join('\n    ')}
}
`)
    .join('\n');

  const errorCodesStruct = (details.error_codes || [])
    .map(({ name, msg }) => `    #[msg("${msg}")] ${name},`)
    .join('\n');

  const hasContextStruct = _functionLogic.includes('#[derive(Accounts)]') && 
                          _functionLogic.includes(`struct ${contextStructName}`);

  const contextStructDefinition = hasContextStruct ? '' : `
#[derive(Accounts)]
pub struct ${contextStructName}<'info> {
${accountsStruct}
}`;

  return `
use anchor_lang::prelude::*;
${stateImport}
${parsedImports}

${docComment}
pub fn ${instructionName}(ctx: Context<${contextStructName}>, params: ${paramsStructName}) -> Result<()> {
    ${_functionLogic}
}

${contextStructDefinition}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ${paramsStructName} {
${paramsStruct}
}

#[error_code]
pub enum ${errorEnumName} {
${errorCodesStruct}
}

${eventsStruct}
`;
}

export function getLibRsTemplate(
    programName: string,
    programId: string,
    fileDetails: LibFileDetail[],
    hasState: boolean = false
  ): string {
    console.log("Lib fileDetails", fileDetails);
  
    const programFunctions = fileDetails
      .map(({ instruction_name, context, params }) => {
        const moduleName = instruction_name;
        
        const functionName = instruction_name;
        
        const contextStruct = context;
        const paramsStruct = params;
        
        return `
        pub fn ${functionName}(ctx: Context<${contextStruct}>, params: ${paramsStruct}) -> Result<()> {
            instructions::${moduleName}::${functionName}(ctx, params)
        }`;
      })
      .join('\n');
  
    const stateModLine = hasState ? "pub mod state;" : "";
  
    return `
    use anchor_lang::prelude::*;
  
    pub mod instructions;
    ${stateModLine}
    use instructions::*;
  
    declare_id!("${programId}");
  
    #[program]
    pub mod ${programName} {
        use super::*;
        
        ${programFunctions}
    }
    `;
}

export function getStateTemplate(fileDetails: StateDetail[]): string {
  const programAccountDetails = fileDetails.filter(
    (detail) => detail.role === 'program_account'
  );

  const accounts = programAccountDetails
    .map(({ account_name, struct_name, fields, description }) => {
      const fieldsStr = fields
        .map(({ name, type, attributes }) => {
          const attributeStr = attributes?.length
            ? attributes.map((attr) => `    #[${attr}]`).join('\n') + '\n'
            : '';
          return `${attributeStr}    pub ${name}: ${type},`;
        })
        .join('\n');

      const descriptionStr = description
        ? `#[doc = "${description}"]\n`
        : '';

      return `
${descriptionStr}#[account]
pub struct ${struct_name} {
${fieldsStr}
}
`;
    })
    .join('\n');

  return `
use anchor_lang::prelude::*;

${accounts}
`;
}
