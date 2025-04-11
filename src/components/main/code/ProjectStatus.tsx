import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip } from "../../ui/tooltip";
import { RiExternalLinkLine } from "react-icons/ri";
import { GoCheckCircle, GoCopy } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { RxCrossCircled } from "react-icons/rx";
import { tooltipStyleLogo } from '../../../styles/builder/headerStyles';
import { projectStatusSection, projectStatusSectionInner, projectStatusStyle, projectStatusStyleHeader } from '../../../styles/code/codeStyle';
import { useColorModeValue } from '../../ui/color-mode';

interface ProjectStatusProps {  
  onBuild: () => void;
  onDeploy: () => void;
  buildStatus: boolean;
  deployStatus: boolean;
}

const ProjectStatus: React.FC<ProjectStatusProps> = ({ onBuild, onDeploy, buildStatus, deployStatus }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
      //navigator.clipboard.writeText('programId' || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    useEffect(() => {
      if (buildStatus || deployStatus) {
        try {
          (async () => {
            //const response = await saveProject(projectContext, setProjectContext);
            //console.log('response', response);
            //if (!response) throw new Error('Failed to save project');
          })();
        } catch (error) {
          console.error('Error updating project status:', error);
        }
      }
    }, [buildStatus, deployStatus]);

    const projectStatusBorder = useColorModeValue('var(--project-status-border-light)', 'var(--project-status-border-dark)');
    const fileTreeBorder = useColorModeValue('var(--filetree-border-light)', 'var(--filetree-border-dark)');

  return (
    <div 
      className="flex border-b" 
      style={{
        ...projectStatusStyle as React.CSSProperties,
        borderColor: projectStatusBorder,
        backgroundColor: "var(--foreground-dark)"
      }}
    >
        {/* Header section */}
        <div className="flex" style={projectStatusStyleHeader as React.CSSProperties}>
            <span className="text-xs font-semibold text-gray-700">Project Name</span>
            <div className="flex flex-row gap-[10px] items-center justify-center">
              <span className="text-[0.7rem] font-semibold text-gray-700 mr-2">Program ID:</span>
              <Tooltip 
                content="About" 
                placement="bottom" 
                openDelay={180}
                contentProps={{ style: { ...tooltipStyleLogo } }}
              >
                <span   
                  className="text-[0.7rem] font-normal text-gray-500 max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis cursor-default"
                >
                  1234567890
                </span>
              </Tooltip>
              <Tooltip 
                content={isCopied ? "Copied!" : "Copy Program ID"}
                placement="bottom"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 h-5 w-5 p-0"
                  onClick={handleCopy}
                >
                  {isCopied ? <IoCheckmark className="text-green-500" /> : <GoCopy />}
                </Button>
              </Tooltip>
            </div>
        </div>
        <div className="flex flex-row gap-6 flex-wrap items-center justify-start w-full px-[15px] py-[5px]">
            <div style={projectStatusSection as React.CSSProperties}>
                {!buildStatus && (
                  <div 
                    className="flex cursor-pointer"
                    style={projectStatusSectionInner as React.CSSProperties}
                    onClick={onBuild}
                  >
                    <span className="text-[0.75rem] font-normal text-[#df5020]">Build</span>
                    <RxCrossCircled size={14} color="#df5020" />
                  </div>
                )}
                {buildStatus && (
                  <div 
                    className="flex"
                    style={projectStatusSectionInner as React.CSSProperties}
                  >
                    <span className="text-[0.75rem] font-normal text-[#46af0e]">Build</span>
                    <GoCheckCircle size={14} color="#46af0e" />
                  </div>
                )}
            </div>
            <div style={projectStatusSection as React.CSSProperties}>
                {!deployStatus && buildStatus && (
                  <div 
                    className="flex cursor-pointer"
                    style={projectStatusSectionInner as React.CSSProperties}
                    onClick={onDeploy}
                  >
                    <span className="text-[0.75rem] font-normal text-[#df5020]">Deploy</span>
                    <RxCrossCircled size={14} color="#df5020" />
                  </div>
                )}
                {deployStatus && buildStatus && (
                  <div 
                    className="flex"
                    style={projectStatusSectionInner as React.CSSProperties}
                  >
                    <span className="text-[0.75rem] font-normal text-[#46af0e]">Deploy</span>
                    <GoCheckCircle size={14} color="#46af0e" />
                  </div>
                )}
                {!deployStatus && !buildStatus && (
                  <div 
                    className="flex"
                    style={projectStatusSectionInner as React.CSSProperties}
                  >
                    <span className="text-[0.75rem] font-normal text-[#df5020]">Deploy</span>
                    <RxCrossCircled size={14} color="#df5020" />
                  </div>
                )}
                {deployStatus && (
                  <a
                    href={``} //https://explorer.solana.com/address/${projectContext.details.programId}?cluster=devnet
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 text-xs font-normal hover:text-[#a9b7ff]"
                  >
                    <RiExternalLinkLine size={12} color="#636363"/>
                  </a>
                )}
            </div>
        </div>
    </div>
  );
};

export default React.memo(ProjectStatus);
