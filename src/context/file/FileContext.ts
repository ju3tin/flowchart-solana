import { createContext } from "react";
import { FileContextType } from "./FileContextTypes";

const FileContext = createContext<FileContextType>({
  selectedFile: null,
  setSelectedFile: () => {},
  fileTree: null,
  setFileTree: () => {},
});

export default FileContext;
