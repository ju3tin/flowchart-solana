"use client";

import React from "react"
import { Toolbox } from "@/components/main/toolbox/Toolbox";
import Chat from "@/components/main/chat/Chat";
import LayoutHeader from "@/components/main/LayoutHeader";
import TaskLogsToast from "@/components/logs/TaskLogsToast";
import useInitializeTaskLogger from "@/hooks/useInitializeTaskLogger";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useInitializeTaskLogger();
  
  return (
    <div className="w-screen h-screen flex flex-col overflow-y-hidden">
      <LayoutHeader />

      <div className="flex flex-1 overflow-hidden">
        <Toolbox />

        <main className="w-full h-full flex-1 overflow-y-auto">
          {children}
        </main>

        <Chat />
        <TaskLogsToast />
      </div>
    </div>
  )
}
