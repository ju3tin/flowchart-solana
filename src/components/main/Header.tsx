"use client";

import React, { useContext } from "react";
import UxContext from "@/context/ux/UxContext";
import FileContext from "@/context/file/FileContext";

// shadcn UI components
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Header() {
  const { activeTab } = useContext(UxContext);
  const { fileTree } = useContext(FileContext);

  // Check if there are any files in the fileTree
  const hasFiles = !!(fileTree && fileTree.children && fileTree.children.length > 0);

  return (
    <TabsList className="bg-[var(--foreground-dark)] p-2 pb-4 flex gap-2">
      <TabsTrigger
        value="workflow"
        className={`cursor-pointer ${activeTab === "workflow" ? "tab-active" : "tab-inactive"}`}
      >
        workflow
      </TabsTrigger>
      <TabsTrigger
        value="interface"
        className={`${hasFiles ? "cursor-pointer" : "cursor-not-allowed"} ${activeTab === "interface" ? "tab-active" : "tab-inactive"}`}
        disabled={!hasFiles}
      >
        interface
      </TabsTrigger>
      <TabsTrigger
        value="code"
        className={`${hasFiles ? "cursor-pointer" : "cursor-not-allowed"} ${activeTab === "code" ? "tab-active" : "tab-inactive"}`}
        disabled={!hasFiles}
      >
        code
      </TabsTrigger>
    </TabsList>
  );
}
