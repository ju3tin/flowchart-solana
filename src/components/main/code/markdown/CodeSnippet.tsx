import React from 'react';
import { Button } from "@/components/ui/button";
import { GoCopy } from "react-icons/go";
import { useColorModeValue } from '../../../ui/color-mode';
import '@/styles/markdown/markdownStyle.css';

const CodeSnippet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const handleCopy = async () => {
    if (typeof children === "string") {
      await navigator.clipboard.writeText(children);
    }
  };

  const codeSnippetBgColor = useColorModeValue("var(--code-snippet-bg-light)", "#1f2533");
  const codeSnippetTextColor = useColorModeValue("var(--code-snippet-text-light)", "#676f82");

  return (
    <div
      className="relative p-[10px] my-[10px] text-[0.8rem] whitespace-pre-wrap overflow-x-auto"
      style={{
        backgroundColor: codeSnippetBgColor,
        color: codeSnippetTextColor,
        border: "1px solid rgb(54, 65, 92)",
        borderRadius: "5px",
        fontFamily: "'Fira Code', monospace",
        lineHeight: "1.15rem",
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute top-1 right-1 z-[1000] h-6 w-6 p-0"
      >
        <GoCopy />
      </Button>
      {children}
    </div>
  );
};

export default CodeSnippet;
