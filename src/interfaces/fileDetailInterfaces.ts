/****************************************
 * 1) Instruction Detail
 ****************************************/
export interface InstructionDetail {
    // e.g. "create_account", "init_mint" (snake_case typically)
    name: string;
  
    // Optional doc comment that becomes #[doc = "..."]
    doc_description?: string;
  
    // e.g. "CreateAccountContext", "InitMintContext"
    context_name: string;
  
    // e.g. "CreateAccountParams", "InitMintParams"
    params_name: string;
  
    // e.g. "CreateAccountError", "InitMintError"
    error_enum_name?: string;
  
    // This is the snippet or placeholder for the function body
    // e.g. "msg!(Initializing mint...); let mint = &mut ctx.accounts.mint; …"
    function_logic?: string;
  
    // The complete raw code for the instruction file, used to bypass template generation
    code?: string;
  
    // List of event definitions
    events?: {
      name: string;
      fields: {
        name: string;
        type: string;
      }[];
    }[];
  
    // If you have error codes with messages
    error_codes?: {
      name: string;
      msg: string;
    }[];
  
    // Additional imports to place at top of file
    // e.g. [{ module: 'anchor_spl::token', items: ['Token', 'Mint'] }]
    imports?: {
      module: string;
      items: string[];
    }[];
  
    // The accounts in the #[derive(Accounts)] struct
    // e.g. "mint: Account<'info, Mint>", "payer: Signer<'info>", etc.
    accounts?: {
      name: { snake: string; pascal: string }; 
      type: string;            // "Account", "Signer", "Program", "Sysvar", etc.
      constraints?: string[];  // ["init", "payer = payer", ...]
    }[];
  
    // The parameters struct fields (like "decimals: u8, authority: Pubkey, ...")
    params?: {
      name: string;
      type: string;
    }[];

    // Indicates whether the project has any program-defined accounts (state)
    hasState: boolean;
}
  
  /****************************************
   * 2) State Detail
   ****************************************/
  export interface StateDetail {
    // e.g. "SomeAccountData"
    account_name: string;
    // e.g. "SomeAccountData"
    struct_name: string;
    // This could be 'program_account' or anything else
    role?: string;
    // Optional doc string
    description?: string;
  
    // The fields for your account struct, e.g. "authority: Pubkey"
    fields: {
      name: string;
      type: string;
      attributes?: string[];
    }[];
  }
  
  /****************************************
   * 3) Lib File Detail
   ****************************************/
  export interface LibFileDetail {
    // Typically the "snake_case" instruction name
    instruction_name: string;
  
    // The "Context" struct name in your instruction
    context: string;
  
    // The "Params" struct name
    params: string;
  }
  
  /****************************************
   * 4) Mod (instructions/mod.rs) Detail
   ****************************************/
  export interface ModFileDetail {
    // The name of each instruction file (snake_case)
    // e.g. ["init_mint", "update_metadata", "transfer_tokens"]
    instructions: string[];
    additionalContext?: string;
  }
  