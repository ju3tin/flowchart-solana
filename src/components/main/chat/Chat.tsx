"use client";

import React, { useState, useRef, useEffect, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

// Context
import ProjectContext from '@/context/project/ProjectContext';
import FileContext from '@/context/file/FileContext';
import { FileTreeItemType } from '@/interfaces/FileTreeItemType';

// API
import { chatAI } from '@/api/aiApi'; 
import { fileApi } from '@/api/fileApi';
import { taskApi } from '@/api/taskApi';

// UI Components
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { 
  Send, 
  Bot, 
  Loader2, 
  X, 
  Maximize2, 
  Minimize2, 
  Code, 
  Image, 
  Paperclip,
  Plus,
  Trash2
} from "lucide-react";
import MarkdownRenderer from '@/components/main/code/markdown/MarkdownRenderer';

export interface AIMessageType {
  text: string;
  sender: 'ai' | 'user';
  files?: FileTreeItemType[];
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error';
}

const Chat: React.FC = () => {
    const { projectContext } = useContext(ProjectContext);
    const { 
        selectedFile, 
        fileTree 
    } = useContext(FileContext);

    const [additionalFiles, setAdditionalFiles] = useState<FileTreeItemType[]>([]);
    const [messages, setMessages] = useState<AIMessageType[]>([]);
    const [input, setInput] = useState('');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
  
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        console.log(selectedFile);
    }, []);

    useEffect(() => {
        const savedMessages = sessionStorage.getItem('chatMessages');
        if (savedMessages) {
            const parsed = JSON.parse(savedMessages);
            const messagesWithDates = parsed.map((msg: AIMessageType) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
            }));
            setMessages(messagesWithDates);
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "40px";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const fetchFileContent = async (projectId: string, filePath: string): Promise<string> => {
        try {
            const data = await fileApi.getFileContent(projectId, filePath);
            return data.message;
        } catch (error) {
            console.error(`Error fetching content for ${filePath}:`, error);
            return 'Error loading content.';
        }
    };

    const { publicKey, connected } = useWallet();

    const sendMessage = async () => {
        if (input.trim()) {
            const selectedFiles = [selectedFile, ...additionalFiles].filter(
                (file): file is FileTreeItemType => Boolean(file)
            );

            console.log("Files selected for context:", selectedFiles);
            
            setMessages([...messages, { 
                text: input, 
                sender: 'user',
                files: selectedFiles,
                timestamp: new Date(),
                status: 'sending'
            }]);
            setInput('');

            setIsTyping(true);

            try {
                const fileTasks = await Promise.all(
                    selectedFiles.map(async (file) => {
                        if (file.path && projectContext.id) {
                            console.log("Fetching content for file:", file.path);
                            const taskResponse = await fileApi.getFileContent(projectContext.id, file.path);
                            return { filePath: file.path, taskId: taskResponse.taskId };
                        }
                        return null;
                    })
                );

                const fetchContent = async (taskId: string): Promise<string> => {
                    while (true) {
                        const { task } = await taskApi.getTask(taskId);
                        if (task.status === 'succeed') return task.result || 'No content available';
                        if (task.status === 'failed') throw new Error('Failed to fetch file content');
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                };

                const fileContexts = await Promise.all(
                    fileTasks.map(async (fileTask) => {
                        if (fileTask) {
                            const content = await fetchContent(fileTask.taskId);
                            console.log("Fetched content for file:", fileTask.filePath, "Length:", content.length);
                            return {
                                path: fileTask.filePath,
                                content: content || 'No content available',
                            };
                        }
                        return { path: 'Unknown path', content: 'No content available' };
                    })
                );

                const userPublicKeyString = connected && publicKey ? publicKey.toBase58() : '';
                console.log('userPublicKeyString', userPublicKeyString);

                setMessages(prevMessages => 
                    prevMessages.map(msg => 
                        msg.text === input && msg.sender === 'user' && msg.status === 'sending'
                            ? { ...msg, status: 'sent' }
                            : msg
                    )
                );

                const response = await chatAI(input, fileContexts, userPublicKeyString);
                const responseText = await response;

                setIsTyping(false);

                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        text: responseText,
                        sender: 'ai',
                        timestamp: new Date(),
                        status: 'sent'
                    },
                ]);
            } catch (error) {
                setIsTyping(false);
                console.error('Failed to send message to AI:', error);
                setMessages(prevMessages => [
                    ...prevMessages,
                    { 
                        text: 'Failed to get a response from AI.', 
                        sender: 'ai',
                        timestamp: new Date(),
                        status: 'error'
                    },
                ]);
            }
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            sendMessage();
            event.preventDefault(); 
        }
    };

    const handleFileSelect = (file: FileTreeItemType) => {
        if (!additionalFiles.find((f) => f.path === file.path)) {
            setAdditionalFiles(prev => [...prev, file]);
        }
    };

    const removeFile = (path: string) => {
        setAdditionalFiles(prevFiles => 
            prevFiles.filter((file) => file.path !== path)
        );
    };

    const getAllFiles = (nodes: FileTreeItemType[], basePath = ''): FileTreeItemType[] => {
        let allFiles: FileTreeItemType[] = [];
        nodes.forEach(node => {
            const currentPath = `${basePath}/${node.name}`;
            if (node.type === 'file') {
                allFiles.push({ ...node, path: currentPath });
            } else if (node.type === 'directory' && node.children) {
                allFiles = allFiles.concat(getAllFiles(node.children, currentPath));
            }
        });
        return allFiles;
    };

    const allFiles = fileTree ? getAllFiles([fileTree]) : [];

    const handleCustomFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newFile: FileTreeItemType = {
                name: file.name,
                path: `custom/${file.name}`,
                type: 'file',
            };
            setAdditionalFiles([...additionalFiles, newFile]);
            toast.success("File added", {
                description: `${file.name} has been added to the chat context.`,
                duration: 3000,
            });
        }
    };

    const formatTime = (dateValue?: Date | string) => {
        if (!dateValue) return "";
        const dateObj = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
        return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const clearChat = () => {
        setMessages([]);
        sessionStorage.removeItem('chatMessages');
        localStorage.removeItem('chatMessages');
    };

    return (
        <div
            className={`flex flex-col w-[25%] ${isExpanded ? "fixed inset-4 z-50" : "h-full"} transition-all duration-300 ease-in-out`}
        >
            <div className="flex flex-col h-full bg-[#0e0e12] overflow-hidden border border-[#232329] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#121218] border-b border-[#232329]">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h4 className="font-medium text-sm text-gray-300">AI Assistant</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-200 hover:bg-[#232329]"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-200 hover:bg-[#232329]"
                            onClick={clearChat}
                        >
                            <Trash2 size={14} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-200 hover:bg-[#232329]"
                        >
                            <X size={14} />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <div className="text-xs flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#232329] scrollbar-track-transparent">
                    <AnimatePresence>
                        {messages.map((message, index) => {
                            const isUser = message.sender === 'user';
                            const displayTime = message.timestamp
                                ? formatTime(message.timestamp)
                                : "03:02 PM";
                            
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-lg ${
                                            isUser
                                                ? "bg-[#0066ff] text-white rounded-tr-none"
                                                : "bg-[#1a1a22] text-gray-100 rounded-tl-none border border-[#2a2a33]"
                                        }`}
                                    >
                                        <div className="p-3">
                                            <div className="flex items-start gap-2">
                                                {!isUser && (
                                                    <div className="mt-1 bg-[#232329] p-1 rounded-full">
                                                        <Bot size={14} className="text-[#0066ff]" />
                                                    </div>
                                                )}
                                                <div className="leading-relaxed">
                                                    <MarkdownRenderer content={message.text} />
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={`flex items-center justify-between text-[10px] px-3 pb-1.5 ${isUser ? "text-blue-50" : "text-gray-500"}`}
                                        >
                                            <span className="font-mono">{displayTime}</span>
                                            {isUser && (
                                                <span className="flex items-center">
                                                    {message.status === "sending" ? <Loader2 size={10} className="animate-spin mr-1" /> : "✓"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                            <div className="bg-[#1a1a22] text-gray-100 rounded-lg rounded-tl-none border border-[#2a2a33] p-3 max-w-[85%]">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#232329] p-1 rounded-full">
                                        <Bot size={14} className="text-[#0066ff]" />
                                    </div>
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-3 bg-[#121218] border-t border-[#232329]">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-1 px-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-200 hover:bg-[#232329]"
                            >
                                <Code size={14} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-200 hover:bg-[#232329]"
                            >
                                <Image size={14} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-200 hover:bg-[#232329]"
                            >
                                <Paperclip size={14} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-gray-400 hover:text-gray-200 hover:bg-[#232329]"
                            >
                                <Plus size={14} />
                            </Button>
                            <div className="flex-1"></div>
                            <div className="text-xs text-gray-500 font-mono">
                                {input.length > 0 ? `${input.length} chars` : "gpt-4o"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-[#1a1a22] rounded-lg p-1 border border-[#2a2a33] focus-within:ring-1 focus-within:ring-[#0066ff] focus-within:border-[#0066ff]">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Message the AI Assistant"
                                className="flex-1 bg-transparent text-gray-200 px-2 py-1.5 min-h-[40px] max-h-[120px] resize-none focus:outline-none text-xs"
                                rows={1}
                            />

                            <Button
                                onClick={sendMessage}
                                disabled={input.trim() === ""}
                                className={`rounded-md px-3 py-1.5 h-auto ${
                                    input.trim() === ""
                                        ? "bg-[#232329] text-gray-500"
                                        : "bg-[#0066ff] hover:bg-[#0052cc] text-white"
                                }`}
                            >
                                <Send size={12} className="mr-2" />
                                <span className="text-xs font-medium">Send</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Status bar */}
                <div className="px-4 py-1.5 bg-[#0e0e12] border-t border-[#232329] flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-mono">v1.0.0</div>
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-500 font-mono">ONLINE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Chat);