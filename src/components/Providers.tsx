"use client";

import { WalletConnectionProvider } from "@/context/WalletConnectionProvider";
import AuthProvider from "@/context/auth/AuthProvider";
import ProjectProvider from "@/context/project/ProjectContextProvider";
import FileContextProvider from "@/context/file/FileContextProvider";
import UxContextProvider from "@/context/ux/UxContextProvider";
import TaskLogsProvider from "@/context/logs/TaskLogsProvider";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WalletConnectionProvider>
        <Provider>
          <AuthProvider>
            <ProjectProvider>
              <FileContextProvider>
                <UxContextProvider>
                  <TaskLogsProvider>
                    {children}
                    <Toaster />
                  </TaskLogsProvider>
                </UxContextProvider>
              </FileContextProvider>
            </ProjectProvider>
          </AuthProvider>
        </Provider>
      </WalletConnectionProvider>
    </>
  );
} 