import { 
  getInstructionTemplate,
  getLibRsTemplate,
  getModRsTemplate,
  getStateTemplate
 } from './getFileTemplates';

import {
  InstructionDetail,
  LibFileDetail,
  ModFileDetail,
  StateDetail,
} from '@/interfaces/fileDetailInterfaces';

type FileType = 'instruction' | 'lib' | 'mod' | 'state';

export function generateFileFromTemplate(
  fileType: FileType,
  details: InstructionDetail | LibFileDetail[] | ModFileDetail | StateDetail[],
  programName?: string,
  programId?: string
): { path: string; content: string } {
  let filePath = '';
  let fileContent = '';

  console.log('file type', fileType);
  console.log('details', details);
  console.log('programName', programName);
  console.log('programId', programId);

  switch (fileType) {
    case 'instruction': {
      const instrDetail = details as InstructionDetail;
      
      if (instrDetail.code && instrDetail.code.trim().length > 0) {
        fileContent = instrDetail.code;
      } else {
        const functionLogic = instrDetail.function_logic || '// AI_FUNCTION_LOGIC';
        fileContent = getInstructionTemplate(instrDetail, functionLogic);
      }

      if (!programName) throw new Error('programName required for instruction file path');
      
      let fileName = instrDetail.name;
      
      filePath = `programs/${programName}/src/instructions/${fileName}.rs`;
      console.log(`[DEBUG_FILE_GEN] Generating instruction file template for: ${fileName}.rs`);
      console.log(`[DEBUG_FILE_GEN] Instruction file will be created at: ${filePath}`);
      break;
    }

    case 'lib': {
      const libDetails = details as LibFileDetail[];
      if (!programName || !programId) {
        throw new Error('Must provide programName and programId to generate lib.rs');
      }
      fileContent = getLibRsTemplate(programName, programId, libDetails);
      filePath = `programs/${programName}/src/lib.rs`;
      break;
    }

    case 'mod': {
      const modDetails = details as ModFileDetail;
      fileContent = getModRsTemplate(modDetails.instructions, modDetails.additionalContext);
      if (!programName) throw new Error('programName required to generate mod.rs path');
      filePath = `programs/${programName}/src/instructions/mod.rs`;
      break;
    }

    case 'state': {
      const stateDetails = details as StateDetail[];
      fileContent = getStateTemplate(stateDetails);

      if (!programName) throw new Error('programName required for state.rs path');
      filePath = `programs/${programName}/src/state.rs`;
      break;
    }

    default:
      throw new Error(`Unsupported fileType: ${fileType}`);
  }

  return { path: filePath, content: fileContent };
}
