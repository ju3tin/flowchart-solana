import { FileTreeItemType } from "@/interfaces/FileTreeItemType";
import { ProjectStateType } from "@/context/project/ProjectContextTypes";
import { parseNodeDetails } from "./parseNodeDetails";
import { generateFileFromTemplate } from "./generateFileFromTemplate";
import {
  InstructionDetail,
  StateDetail,
  LibFileDetail,
  ModFileDetail,
} from "@/interfaces/fileDetailInterfaces";

export function genSrcFiles(
  projectState: ProjectStateType,
  programName: string,
  programId: string
): FileTreeItemType | null {
  try {
    const { instructions, state, lib, mod } = parseNodeDetails(projectState);

    const srcDir: FileTreeItemType = {
      name: "src",
      path: "./src",
      type: "directory",
      children: [],
    };

    const libFile = generateFileFromTemplate("lib", lib, programName, programId);
    srcDir.children?.push({
      name: "lib.rs",
      path: "./src/lib.rs",
      type: "file",
      code: libFile.content,
    });

    const instrDir: FileTreeItemType = {
      name: "instructions",
      path: "./src/instructions",
      type: "directory",
      children: [],
    };

    const modFile = generateFileFromTemplate("mod", mod, programName);
    instrDir.children?.push({
      name: "mod.rs",
      path: "./src/instructions/mod.rs",
      type: "file",
      code: modFile.content,
    });

    instructions.forEach((instrDetail) => {
      const instrFile = generateFileFromTemplate(
        "instruction",
        instrDetail,
        programName
      );
      instrDir.children?.push({
        name: `${instrDetail.name}.rs`,
        path: `./src/instructions/${instrDetail.name}.rs`,
        type: "file",
        code: instrFile.content,
      });
    });

    srcDir.children?.push(instrDir);

    if (state.length > 0) {
      const stateFile = generateFileFromTemplate("state", state, programName);
      srcDir.children?.push({
        name: "state.rs",
        path: "./src/state.rs",
        type: "file",
        code: stateFile.content,
      });
    }

    return srcDir;
  } catch (error) {
    console.error("Error in genSrcFiles:", error);
    return null;
  }
}    