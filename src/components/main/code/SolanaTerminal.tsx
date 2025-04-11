import React, { useState, useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import { useColorModeValue } from '@/components/ui/color-mode';

interface CommandHistoryItem {
  command: string;
  output: string;
  isError?: boolean;
  timestamp: Date;
}

export default function SolanaTerminal() {
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([
    {
      command: "solana --version",
      output: "solana-cli 1.16.15 (src:devbuild; feat:2916577066)",
      timestamp: new Date(),
    },
    {
      command: "solana balance",
      output: "95.95 SOL",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);
  const [showCursor, setShowCursor] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const terminalBg = useColorModeValue('var(--terminal-bg-light)', 'var(--terminal-bg-dark)');
  const terminalBorder = useColorModeValue('var(--border-2-light)', 'var(--border-2-dark)');

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    if (terminalRef.current) {
      terminalRef.current.addEventListener("click", handleClick);
    }

    return () => {
      if (terminalRef.current) {
        terminalRef.current.removeEventListener("click", handleClick);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    let output = "";
    let isError = false;

    if (input.startsWith("solana ")) {
      if (input.includes("deploy")) {
        output = "Program deployed successfully\nProgram ID: BPF1H9tDMX3NoTX7QK3BYd2BDTUDYxkecERJHtbNsztD";
      } else if (input.includes("balance")) {
        output = "95.95 SOL";
      } else if (input.includes("help")) {
        output =
          "USAGE:\n  solana [OPTIONS] <SUBCOMMAND>\n\nOPTIONS:\n  -h, --help    Print help information\n  -V, --version Print version information\n\nSUBCOMMANDS:\n  balance       Get wallet balance\n  deploy        Deploy a program\n  transfer      Transfer tokens";
      } else {
        output = `Command '${input}' executed successfully`;
      }
    } else if (input === "clear" || input === "cls") {
      setCommandHistory([]);
      setInput("");
      return;
    } else {
      output = `Command not found: ${input}`;
      isError = true;
    }

    setCommandHistory((prev) => [
      ...prev,
      {
        command: input,
        output,
        isError,
        timestamp: new Date(),
      },
    ]);
    setInput("");
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div 
      className="font-oxygen-mono text-xs flex flex-col h-full text-white font-mono overflow-hidden" 
      style={{ 
        backgroundColor: '#0e0e12',
        borderColor: terminalBorder
      }}
    >
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-900 bg-[#0e0e12]">
        <Terminal className="w-3 h-3 mr-2 text-gray-600" />
        <span className="font-semibold text-xs text-gray-600">Terminal</span>
      </div>

      {/* Terminal Body */}
      <div
        ref={terminalRef}
        className="flex-1 p-3 overflow-y-auto bg-[#0e0e12] border-none">
        {commandHistory.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-[#7ea465] mr-2">➜</span>
              <span className="text-[#7aa2f7] mr-2">solana-cli</span>
              <span className="text-[#5A5F73] text-xs mr-2">{formatTimestamp(item.timestamp)}</span>
              <span className="text-white">{item.command}</span>
            </div>
            <div className={`ml-6 mt-1 whitespace-pre-wrap ${item.isError ? "text-[#FF3B9A]" : "text-[#E0E0FF]"}`}>
              {item.output}
            </div>
          </div>
        ))}

        <form onSubmit={handleSubmit} className="flex items-center mt-1">
          <span className="text-[#7ea465] mr-2">➜</span>
          <span className="text-[#7aa2f7] mr-2">solana-cli</span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-transparent outline-none text-white"
              autoFocus
            />
            {input === "" && showCursor && (
              <span className="absolute top-0 left-0 h-full w-2 bg-white opacity-70 animate-blink"></span>
            )}
          </div>
        </form>
      </div>

      <div 
        className="px-3 py-1.5 border-t flex justify-between items-center text-[10px] text-[#5A5F73]
        border-t border-gray-900 bg-[#0e0e12]"
      >
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#14F195] mr-2"></div>
          <span className="text-gray-600">ONLINE</span>
        </div>
        <div>v1.0.0</div>
        <div>solana-cli</div>
      </div>
    </div>
  );
} 