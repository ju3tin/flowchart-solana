"use client";

import React, { useState, useEffect } from "react";
import FileContext from "./FileContext";
import { FileContextType } from "./FileContextTypes";
import { FileTreeItemType } from "../../interfaces/FileTreeItemType";

// Helper function to parse the stored file tree
function getInitialFileTree(): FileTreeItemType | null {
  try {
    const stored = localStorage.getItem("fileTree");
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Could not parse fileTree from localStorage:", error);
    return null;
  }
}

// Sample default file tree to use when no data is available
const defaultFileTree: FileTreeItemType = {
  name: "Project Files",
  type: "directory",
  path: "root",
  children: [
    {
      name: "src",
      type: "directory",
      path: "root/src",
      children: [
        {
          name: "components",
          type: "directory",
          path: "root/src/components",
          children: [
            {
              name: "App.tsx",
              type: "file",
              path: "root/src/components/App.tsx",
            }
          ]
        },
        {
          name: "index.ts",
          type: "file",
          path: "root/src/index.ts",
        }
      ]
    },
    {
      name: "README.md",
      type: "file",
      path: "root/README.md",
    }
  ]
};

// NEW: Helper to parse the stored selected file
function getInitialSelectedFile(): FileTreeItemType | null {
  try {
    const stored = localStorage.getItem("selectedFile");
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Could not parse selectedFile from localStorage:", error);
    return null;
  }
}

const FileContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with null - no localStorage calls at initialization
  const [selectedFile, setSelectedFile] = useState<FileTreeItemType | null>(null);
  const [fileTree, setFileTree] = useState<FileTreeItemType | null>(null);

  // Load from localStorage after component mounts
  useEffect(() => {
    try {
      // Load fileTree
      const storedFileTree = localStorage.getItem("fileTree");
      if (storedFileTree) {
        setFileTree(JSON.parse(storedFileTree));
      } else {
        // Set default file tree if nothing is in localStorage
        setFileTree(defaultFileTree);
      }

      // Load selectedFile
      const storedSelectedFile = localStorage.getItem("selectedFile");
      if (storedSelectedFile) {
        setSelectedFile(JSON.parse(storedSelectedFile));
      }
    } catch (error) {
      console.warn("Could not parse data from localStorage:", error);
      // Set default file tree if there was an error
      setFileTree(defaultFileTree);
    }
  }, []);

  // Save fileTree to localStorage whenever it changes
  useEffect(() => {
    try {
      if (fileTree) {
        localStorage.setItem("fileTree", JSON.stringify(fileTree));
      } else {
        localStorage.removeItem("fileTree");
      }
    } catch (error) {
      console.warn("Error saving fileTree to localStorage:", error);
    }
  }, [fileTree]);

  // Save selectedFile to localStorage whenever it changes
  useEffect(() => {
    try {
      if (selectedFile) {
        localStorage.setItem("selectedFile", JSON.stringify(selectedFile));
      } else {
        localStorage.removeItem("selectedFile");
      }
    } catch (error) {
      console.warn("Error saving selectedFile to localStorage:", error);
    }
  }, [selectedFile]);

  const contextValue: FileContextType = {
    selectedFile,
    setSelectedFile,
    fileTree,
    setFileTree,
  };

  return (
    <FileContext.Provider value={contextValue}>
      {children}
    </FileContext.Provider>
  );
};

export default FileContextProvider;
