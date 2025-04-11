"use client";

import React, { useEffect, useContext } from "react";
import Workflow from "@/components/main/workflow/Workflow";
import Interface from "@/components/main/interface/Interface";
import Code from "@/components/main/code/Code";
import Chat from "@/components/main/chat/Chat";
import Header from "@/components/main/Header";

// Hooks    
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";

// Context
import ProjectContext from "@/context/project/ProjectContext";
import UxContext from "@/context/ux/UxContext";
import FileContext from "@/context/file/FileContext";
import AuthContext from "@/context/auth/AuthContext";
import { ActiveTab } from "@/context/ux/UxContextTypes";

// Styles
import "@/styles/body/bodyStyles.css";

// shadcn UI components
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// React Icons
import { FaCircle } from "react-icons/fa";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { LuWallet } from "react-icons/lu";
import { MessageSquareMore } from "lucide-react";

// Utils
import { ProjectInfo } from "./Toolbar";

const Builder = () => {
    const { projectContext } = useContext(ProjectContext);
    
    const { connected, publicKey, connect, disconnect, select } = useWallet();
    const { user, updateWalletPublicKey } = useContext(AuthContext);

    const { activeTab, setActiveTab, uxOpenPanel, setUxOpenPanel, isChatOpen, setIsChatOpen } = useContext(UxContext);
    const { fileTree, setFileTree, setSelectedFile } = useContext(FileContext);

    const handleWalletClick = async () => {
        console.log('handleWalletClick', connected);
        try {
            if (!connected) {
                await select(PhantomWalletName);
                await connect(); 
            } else {
                console.log("disconnecting wallet");
                await disconnect();
            }
        } catch (error) {
            console.error('Wallet connect error:', error);
        }
    };

    // Add an effect that runs whenever connected or publicKey changes
    useEffect(() => {
        console.log("connected", connected);
        console.log("publicKey", publicKey);
        if (connected && publicKey) {
            // Only update if the user's current walletPublicKey is different
            if (user?.walletPublicKey !== publicKey.toBase58()) {
                console.log('Wallet is fully connected; publicKey =', publicKey.toBase58());
                updateWalletPublicKey(publicKey.toBase58());
            }
        } else {
            console.log('Wallet is disconnected or no key yet');
        }
    }, [connected, publicKey, user?.walletPublicKey, updateWalletPublicKey]);

    // Effect to update account nodes when wallet connection changes
    useEffect(() => {
        if (!projectContext.details?.setProjectState) return;

        const walletString = connected && publicKey
            ? publicKey.toBase58()
            : "not set";

        console.log("Wallet:", walletString);

        projectContext.details.setProjectState((prevState) => {
            let changed = false;

            const newNodes = prevState.nodes.map((node) => {
                if (node.type !== "accountNode" || !node.data?.fields) {
                    return node; // no change
                }

                const nodeLabel = node.data.label;
                let updatedFields = [...node.data.fields]; // shallow copy

                if (nodeLabel === "Mint Account") {
                    // For Mint Account, auto-fill "Mint Authority" / "Freeze Authority"
                    updatedFields = updatedFields.map((field) => {
                        if (
                            field.label === "Mint Authority" ||
                            field.label === "Freeze Authority"
                        ) {
                            if (field.value === walletString) {
                                return field; // no update
                            }
                            changed = true;
                            return { ...field, value: walletString };
                        }
                        return field;
                    });
                } else if (
                    nodeLabel === "Mint Authority" ||
                    nodeLabel === "Payer Account"
                ) {
                    // For these, auto-fill "Address" field
                    updatedFields = updatedFields.map((field) => {
                        if (field.label === "Address") {
                            if (field.value === walletString) {
                                return field; // no update
                            }
                            changed = true;
                            return { ...field, value: walletString };
                        }
                        return field;
                    });
                }

                if (changed) {
                    
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            fields: updatedFields,
                        },
                    };
                }
                return node;
            });

            if (!changed) {
                return prevState;
            }

            return {
                ...prevState,
                nodes: newNodes,
            };
        });
    }, [connected, publicKey]);

    return (
        <div style={{ border: '1px solid red' }}
        className="relative flex-1 h-[98%] p-2 w-full bg-[var(--body-bg-dark)] flex flex-col justify-center items-center">
            <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as ActiveTab)}
                className="h-full w-full"
                
            >
                <Header />
                <ProjectInfo />
                <div className="w-full h-full flex">                        
                    <TabsContent value="workflow" className="h-full w-full">
                        <div className="w-full h-full flex">
                            {/* Left side: main content */}
                            <div className="flex-auto">
                                <Workflow />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="interface" className="h-full w-full">
                        <div className="w-full h-full flex">
                            <div className="flex-auto">
                                <Interface />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="code" className="h-full w-full">
                        <div className="w-full h-full flex">
                            <div className="flex-auto">
                                <Code />
                            </div>
                        </div>
                    </TabsContent>
                </div>
                
                {/* Fixed Chat Panel */}
                {isChatOpen && (
                    <div className="fixed right-0 top-[180px] z-[9999] w-[300px] h-[calc(100vh-210px)] border-l border-[var(--border-2-dark)] bg-[var(--chat-bg-dark)] shadow-xl">
                        <Chat />
                    </div>
                )}
            </Tabs>
        </div>
    );
};

export default Builder;