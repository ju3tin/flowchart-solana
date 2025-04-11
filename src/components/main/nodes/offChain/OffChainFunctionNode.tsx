import React, { useState, useContext, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { useWallet } from '@solana/wallet-adapter-react';
import ProjectContext from '@/context/project/ProjectContext';
import { Upload, Code, Info, ImageIcon, CheckCircle, Copy, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

interface FieldType {
  type: string;
  label: string;
  required?: boolean;
  value?: any;
  description?: string;
}

interface NodeData {
  label: string;
  functionName?: string;
  parameters?: FieldType[];
  onChange?: (label: string, value: any) => void;
  runFunction?: (fieldValues: Record<string, any>, wallet: any, setFieldValues: React.Dispatch<React.SetStateAction<Record<string, any>>>, setActiveTab: React.Dispatch<React.SetStateAction<string>>) => Promise<any>;
  type?: string;
}

interface OffChainFunctionNodeProps {
  data: NodeData;
  id: string;
  type?: string;
}

const isFileUploadField = (field: FieldType): boolean => {
  if (field.type === 'image' || field.type === 'file') return true;
  
  const label = field.label.toLowerCase();
  return label.includes('image') || 
         label.includes('file') || 
         label.includes('upload') || 
         label.includes('picture');
};

interface FieldInputProps {
  parameter: FieldType;
  value: any;
  onChange: (label: string, value: any) => void;
}

const FieldInput: React.FC<FieldInputProps> = ({ parameter, value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.warning(`The file is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Large files may cause upload issues.`, {
        duration: 5000
      });
    }
    
    if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) {
      compressImage(file, parameter.label, onChange);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(parameter.label, {
          file,
          preview: reader.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const compressImage = (file: File, fieldLabel: string, onChange: (label: string, value: any) => void) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;
        
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Get the compressed data URL (0.85 quality)
        const compressedDataUrl = canvas.toDataURL(file.type, 0.85);
        
        // Create a blob from the compressed data URL
        fetch(compressedDataUrl)
          .then(res => res.blob())
          .then(blob => {
            // Create a new file from the blob
            const compressedFile = new File([blob], file.name, { 
              type: file.type,
              lastModified: file.lastModified 
            });
            
            // Show compression result
            const compressionRatio = (file.size / blob.size).toFixed(2);
            console.log(`Compressed image from ${(file.size/1024).toFixed(2)}KB to ${(blob.size/1024).toFixed(2)}KB (${compressionRatio}x)`);
            
            if (blob.size < file.size) {
              toast.info(`Compressed from ${(file.size / (1024 * 1024)).toFixed(2)}MB to ${(blob.size / (1024 * 1024)).toFixed(2)}MB`, {
                duration: 3000
              });
            }
            
            // Update with the compressed file
            onChange(fieldLabel, {
              file: compressedFile,
              preview: compressedDataUrl,
              name: file.name
            });
          });
      };
    };
    
    reader.readAsDataURL(file);
  };
  
  // For image or file type fields, render a file input
  if (isFileUploadField(parameter)) {
    // Determine if this is an image field
    const isImageField = parameter.type === 'image' || parameter.label.toLowerCase().includes('image');
    
    return (
      <div className="flex flex-col gap-3 w-full">
        {value && value.preview ? (
          // If file is already uploaded, show preview with option to change
          <div className="flex flex-col items-center justify-center w-full rounded-md p-2 bg-primary/10 border border-primary/20">
            <img 
              src={value.preview}
              alt={value.name || "Uploaded file"}
              className="h-[70px] w-auto object-contain rounded-md mb-1"
            />
            <p className="text-[8px] text-gray-300 mb-1">
              {value.name}
            </p>
            <Button 
              size="sm"
              variant="secondary"
              className="h-5 text-[8px] bg-gray-800 hover:bg-gray-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              Change {isImageField ? 'Image' : 'File'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder={`Select ${isImageField ? 'image' : 'file'}`}
              readOnly
              className="flex-1 border-gray-700 bg-gray-800 text-gray-100"
            />
            <div className="relative">
              <Button variant="secondary" className="bg-gray-800 hover:bg-gray-700">
                <ImageIcon className="mr-1 h-4 w-4" />
                Browse
              </Button>
              <Input
                type="file"
                accept={isImageField ? "image/*" : undefined}
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={isImageField ? "image/*" : undefined}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }
    return parameter.type === 'textarea' ? (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange(parameter.label, e.target.value)}
      placeholder={`Enter ${parameter.label.toLowerCase()}`}
      className="min-h-[80px] border-gray-700 bg-gray-800 text-gray-100"
    />
  ) : (
    <Input
      value={value || ''}
      type={parameter.type === 'number' ? 'number' : 'text'}
      onChange={(e) => onChange(parameter.label, e.target.value)}
      placeholder={`Enter ${parameter.label.toLowerCase()}`}
      className="border-gray-700 bg-gray-800 text-gray-100"
    />
  );
};

export function OffChainFunctionNode({ data, id, type }: OffChainFunctionNodeProps) {
  const { label, functionName, parameters } = data;
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(
    parameters?.reduce((acc: Record<string, any>, field: FieldType) => ({ ...acc, [field.label]: field.value }), {}) || {}
  );
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const [storageUrl, setStorageUrl] = useState<string | null>(null);
  const { projectContext } = useContext(ProjectContext);
  const { connected, publicKey, signTransaction } = useWallet();
  const wallet = useWallet();

  console.log("OffChainFunctionNode -> data:", data);
  useEffect(() => {
    console.log(`data:`, data);
  }, [data]);
  
  const nodeType = type || data.type || 'unknown';
  
  const isInjecting = Boolean(projectContext.injectingNodeTypes?.includes(nodeType));
  
  console.log(`Node ID: ${id}, type: ${nodeType}, isInjecting: ${isInjecting}`);
  console.log(`injectingNodeTypes:`, projectContext.injectingNodeTypes);

  const handleInputChange = (label: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [label]: value }));
    if (data.onChange) {
      data.onChange(label, value);
    }
  };

  const handleRunFunction = async () => {
    if (!projectContext?.id) {
      toast.error('Cannot execute function - project ID is missing', {
        duration: 5000
      });
      return;
    }
  
    const missingRequiredParameters = parameters
      ?.filter((param: FieldType) => param.required && !fieldValues[param.label])
      .map((param: FieldType) => param.label);
  
    if (missingRequiredParameters && missingRequiredParameters.length > 0) {
      toast.error(`Please fill in: ${missingRequiredParameters.join(', ')}`, {
        duration: 5000
      });
      return;
    }
  
    if (!connected || !publicKey) {
      toast.error('Please connect your Solana wallet before proceeding', {
        duration: 5000
      });
      return;
    }

    if (!data.runFunction) {
      toast.error(`No 'runFunction' found on node type: ${nodeType}`, {
        duration: 5000
      });
      return;
    }
  
    setIsRunning(true);
  
    try {
      const result = await data.runFunction(fieldValues, wallet, setFieldValues, setActiveTab);
      
      if (result && result.metadataUrl) {
        setStorageUrl(result.metadataUrl);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`Error in ${label}`, {
        description: errorMessage,
        duration: 6000
      });
      console.error(`${label} error:`, err);
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard', {
      duration: 2000
    });
  };

  return (
    <div className="relative">
      <Card className="w-full border-gray-800 bg-gray-900 shadow-lg">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-gray-800 bg-gray-900 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Upload className="h-4 w-4" />
          </div>
          <div className="flex flex-1 items-center">
            <h3 className="text-lg font-semibold text-white">{label}</h3>
            <Badge variant="outline" className="ml-2 border-primary/20 bg-primary/10 text-primary">
              IPFS
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={handleRunFunction}
            disabled={isRunning || isInjecting}
          >
            {isRunning ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-transparent"></div>
            ) : isInjecting ? (
              <ClipLoader size="10px" color="hsl(215, 100%, 60%)" />
            ) : (
              <Play className="h-4 w-4 text-primary" />
            )}
          </Button>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 p-0">
            <TabsTrigger
              value="config"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-gray-800"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-gray-800"
            >
              Output
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="m-0">
            <CardContent className="p-0">
              <SimpleBar
                style={{
                  height: "200px",
                  width: "100%",
                  pointerEvents: "all"
                }}
                onWheelCapture={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="space-y-4 p-4">
                  {parameters?.map((parameter: FieldType, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <Label className="ml-2 text-sm font-medium text-gray-200">
                          {parameter.label}
                          {parameter.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="ml-1 h-3.5 w-3.5 cursor-help text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="w-[200px] text-xs">{parameter.description || `Enter ${parameter.label.toLowerCase()}`}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FieldInput
                        parameter={parameter}
                        value={fieldValues[parameter.label]}
                        onChange={handleInputChange}
                      />
                    </div>
                  ))}
                </div>
              </SimpleBar>
            </CardContent>

            <CardFooter className="flex justify-end border-t border-gray-800 p-4">
              <Button
                onClick={handleRunFunction}
                disabled={isRunning || isInjecting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isRunning ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-transparent"></div>
                    {nodeType === "createNftNode" ? "Creating..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {nodeType === "createNftNode" ? "Create NFT Accounts" : "Upload to IPFS"}
                  </>
                )}
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="output" className="m-0">
            <CardContent className="p-4">
              {nodeType === "createNftNode" && fieldValues.transactionSignature ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Transaction Signature</span>
                      <span className="text-white text-sm font-mono bg-[#1a202c] px-2 py-1 rounded truncate max-w-[220px]">
                        {fieldValues.transactionSignature}
                      </span>
                    </div>

                    <div className="border-t border-[#1e2530] pt-3">
                      <h3 className="text-white text-sm mb-2">Accounts Created</h3>
                      <div className="space-y-2 pl-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Mint Account</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-mono bg-[#1a202c] px-2 py-1 rounded truncate max-w-[220px]">
                              {fieldValues.mintAccount}
                            </span>
                            <span className="text-green-500">✓</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Metadata Account</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-mono bg-[#1a202c] px-2 py-1 rounded truncate max-w-[220px]">
                              {fieldValues.metadataAccount}
                            </span>
                            <span className="text-green-500">✓</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Associated Token Account</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs font-mono bg-[#1a202c] px-2 py-1 rounded truncate max-w-[220px]">
                              {fieldValues.associatedTokenAccount}
                            </span>
                            <span className="text-green-500">✓</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#1e2530] pt-3">
                      <h3 className="text-white text-sm mb-2">Authorities</h3>
                      <div className="space-y-2 pl-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Mint Authority</span>
                          <span className="text-white text-xs font-mono bg-[#1a202c] px-2 py-1 rounded truncate max-w-[220px]">
                            {fieldValues.mintAuthority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Freeze Authority</span>
                          <span className="text-white text-xs font-mono bg-[#1a202c] px-2 py-1 rounded truncate max-w-[220px]">
                            {fieldValues.freezeAuthority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">Update Authority</span>
                          <span className="text-white text-xs font-mono bg-[#1a202c] px-2 py-1 rounded truncate max-w-[220px]">
                            {fieldValues.updateAuthority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : fieldValues.metadataUrl || storageUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 p-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Upload Successful</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-200">IPFS URL</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 overflow-hidden rounded-md border border-gray-700 bg-gray-800 p-2">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-gray-400" />
                          <code className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-gray-200">
                            {fieldValues.metadataUrl || storageUrl}
                          </code>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(fieldValues.metadataUrl || storageUrl || '')}
                        className="h-9 w-9 border-gray-700 bg-gray-800 hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-200">Gateway URL</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 overflow-hidden rounded-md border border-gray-700 bg-gray-800 p-2">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                          <code className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-gray-200">
                            {(fieldValues.metadataUrl || storageUrl || '')?.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                          </code>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open((fieldValues.metadataUrl || storageUrl || '')?.replace('ipfs://', 'https://ipfs.io/ipfs/'), '_blank')}
                        className="h-9 w-9 border-gray-700 bg-gray-800 hover:bg-gray-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border border-gray-700 bg-gray-800 p-3">
                    <div className="mb-2 text-xs font-medium text-gray-400">Metadata Preview</div>
                    <pre className="overflow-x-auto rounded bg-gray-950 p-2 text-xs text-gray-300">
                      {JSON.stringify(
                        {
                          name: fieldValues["Name"] || "Untitled NFT",
                          description: fieldValues["Description"] || "No description provided",
                          image: fieldValues.metadataUrl || storageUrl,
                          attributes: [],
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-center text-gray-400">
                  <Upload className="h-10 w-10 opacity-40" />
                  <p>{nodeType === "createNftNode" ? "No NFT accounts created yet" : "No upload data available yet"}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("config")}
                    className="mt-2 border-gray-700"
                  >
                    {nodeType === "createNftNode" ? "Go to Create" : "Go to Upload"}
                  </Button>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Handles for node connections */}
      <Handle
        id="input-handle-left"
        type="source"
        position={Position.Left}
        className="!bg-gray-400 !border-gray-600"
        style={{
          width: '8px',
          height: '8px',
          left: '-4px',
        }}
      />

      <Handle
        id="input-handle-right"
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !border-gray-600"
        style={{
          width: '8px',
          height: '8px',
          right: '-4px',
        }}
      />
    </div>
  );
}
