"use client";

import React, { useContext, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/main/Header";
import Workflow from "@/components/main/workflow/Workflow";
import Interface from "@/components/main/interface/Interface";
import Code from "@/components/main/code/Code";
import UxContext from "@/context/ux/UxContext";
import FileContext from "@/context/file/FileContext";
import { ActiveTab } from "@/context/ux/UxContextTypes";

export default function MainPage() {
  const { activeTab, setActiveTab } = useContext(UxContext);
  const { fileTree } = useContext(FileContext);

  const hasFiles = !!(fileTree && fileTree.children && fileTree.children.length > 0);

  useEffect(() => {
    if (!hasFiles && (activeTab === 'interface' || activeTab === 'code')) {
      setActiveTab('workflow');
    }
  }, [hasFiles, activeTab, setActiveTab]);

  return (
    <Tabs 
      value={activeTab}
      onValueChange={(value) => {
        if ((value === 'interface' || value === 'code') && !hasFiles) {
          return;
        }
        setActiveTab(value as ActiveTab);
      }}
      className="h-full w-full flex flex-col"
    >
      {/* <Header /> */}

      <div className="flex items-center justify-start w-full">
      <TabsList className="mx-4 my-2 px-1 bg-[#1e1e24] w-fit border border-gray-800 rounded-sm">
        <TabsTrigger
          value="workflow"
          className="
            data-[state=active]:bg-[#4f46e5]
            data-[state=active]:text-white
            px-3 py-1 text-sm font-medium
            hover:bg-[#2a2a2d]
            rounded-sm
            cursor-pointer
          "
        >
          workflow
        </TabsTrigger>

        <TabsTrigger
          value="interface"
          disabled={!hasFiles}
          className="
            data-[state=active]:bg-[#4f46e5]
            data-[state=active]:text-white
            px-3 py-1 text-sm font-medium
            hover:bg-[#2a2a2d]
            rounded-sm
            cursor-pointer
          "
        >
          interface
        </TabsTrigger>

        <TabsTrigger
          value="code"
          disabled={!hasFiles}
          className="
            data-[state=active]:bg-[#4f46e5]
            data-[state=active]:text-white
            px-3 py-1 text-sm font-medium
            hover:bg-[#2a2a2d]
            rounded-sm
          "
        >
          code
        </TabsTrigger>
      </TabsList>
      </div>
      <TabsContent value="workflow" className="flex-1 h-full overflow-auto">
        <Workflow />
      </TabsContent>

      <TabsContent value="interface" className="flex-1 h-full overflow-auto">
        <Interface />
      </TabsContent>

      <TabsContent value="code" className="flex-1 h-full overflow-auto">
        <Code />
      </TabsContent>
    </Tabs>
  );
}