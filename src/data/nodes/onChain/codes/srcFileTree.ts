import { FileTreeItemType } from "../../../../interfaces/FileTreeItemType";

export const srcFileTreeTemplate = (instructionNames: string[]): FileTreeItemType => {
    return {
        name: "src",
        type: "directory",
        path: "./src",
        children: [
            {
                name: "instructions",
                type: "directory",
                path: "./src/instructions",
                children: [
                    {
                        name: "mod.rs",
                        type: "file",
                        ext: "rs",
                        path: "./src/instructions/mod.rs",
                        status: "generated",
                    },
                    ...instructionNames.map((instructionName): FileTreeItemType => ({
                        name: `${instructionName}.rs`,
                        type: "file",
                        ext: "rs",
                        path: `./src/instructions/${instructionName}.rs`,
                        status: "generated"
                    }))
                ]
            },
            { 
                name: "state.rs", 
                type: "file", 
                ext: "rs",
                path: "./src/state.rs",
                status: "generated"
            },
            { 
                name: "lib.rs", 
                type: "file", 
                ext: "rs",
                path: "./src/lib.rs",
                status: "generated"
            }
        ]
    };
};
