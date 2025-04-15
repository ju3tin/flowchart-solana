"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Cpu, Layers } from "lucide-react"
import { BsTelegram } from "react-icons/bs";
import { BsTwitterX } from "react-icons/bs";
import { BsYoutube } from "react-icons/bs";
import { useEffect, useState } from "react"
import InstructionNode from "@/components/landing/InstructionNode"
import { mockInstructions } from "@/data/mockInstructions/instructions"

export default function LandingPage() {
  // State for animated elements
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Clean up animation frames on unmount
    return () => {
      setMounted(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white font-mono overflow-x-hidden">
      {/* Matrix-like background effect */}
      <div className="fixed inset-0 z-0 opacity-15 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-[#00ff41] text-sm"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `fall ${5 + Math.random() * 15}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {String.fromCharCode(33 + Math.floor(Math.random() * 94))}
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-[#1e2033] bg-[#0a0b14]/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 relative">
              <img src="/assets/logo.png" alt="FlowCode Logo" className="w-full h-full" />
              <div className="absolute inset-0 bg-[#5580ff]/20 blur-xl rounded-full"></div>
            </div>
            <span className="text-xl font-bold tracking-tighter">
              <span className="text-white">Solana</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5f88dc] via-[#1cf6a0] to-[#9945ff]" 
                style={{
                  backgroundSize: "300% 300%",
                  animation: "gradientFlow 3s ease infinite"
                }}>FlowCode</span>
          </span>
        </div>

          <div className="hidden md:flex items-center space-x-12">
            <Link href="#features" className="text-gray-400 hover:text-[#5580ff] transition-colors text-sm">
            Features
          </Link>
            <Link href="#demo" className="text-gray-400 hover:text-[#5580ff] transition-colors text-sm">
              Demo
          </Link>
            <Link href="#team" className="text-gray-400 hover:text-[#5580ff] transition-colors text-sm">
              Team
          </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex justify-center relative w-screen h-[100vh] py-4 sm:py-6 md:py-10 lg:py-12 overflow-hidden">
        <div className="w-full h-full container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col w-full h-full md:flex-row items-start py-16 sm:py-20 md:py-25">
            {/* Left side content */}
            <div className="w-full md:w-2/5 lg:w-2/5 mb-12 md:mb-0 pr-0 md:pr-4 lg:pr-8">
              <div className="inline-block px-2 sm:px-3 py-1 mb-4 sm:mb-6 rounded-full bg-[#1e2033] border border-[#2a2d4a] text-xs text-[#5580ff]">
                <span className="mr-2">●</span> Visual AI Developer Tool for Solana
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
                <span className="block">Build Solana dApps</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5f88dc] via-[#1cf6a0] to-[#9945ff]" 
                  style={{
                    backgroundSize: "300% 300%",
                    animation: "gradientFlow 3s ease infinite"
                  }}>
                  Without Code
                </span>
              </h1>
              <p className="text-gray-400 mb-6 sm:mb-8 max-w-lg text-xs sm:text-sm leading-relaxed">
                <ul className="list-disc list-inside">
                  <li><span className="text-white font-semibold">FlowCode</span> transforms English into Solana programs.</li>
                  <li>Design, build, and deploy decentralized applications with our visual workflow builder and
                  specialized Solana IDE.</li>
                </ul>
              </p>
              <div className="flex flex-col sm:flex-row justify-start gap-2">
                <Button size="lg" className="bg-[#5580ff] hover:bg-[#4466cc] text-white p-2 rounded whitespace-nowrap">
                  <span className="mr-2 text-xs sm:text-sm">Join the Waitlist</span> <ArrowRight className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center gap-2 hover:bg-none mt-2 sm:mt-0">
                    <Button size="icon" variant="ghost"><BsTelegram className="h-4 w-4 sm:h-5 sm:w-5 text-[#5580ff] cursor-pointer hover:bg-none" /></Button>
                    <Button size="icon" variant="ghost"><BsTwitterX className="h-4 w-4 sm:h-5 sm:w-5 text-[#5580ff] cursor-pointer hover:bg-none" /></Button>
                    <Button size="icon" variant="ghost"><BsYoutube className="h-4 w-4 sm:h-5 sm:w-5 text-[#5580ff] cursor-pointer hover:bg-none" /></Button>
                </div>
              </div>
            </div>

            {/* Right side - split into instruction nodes and code snippet */}
            <div className="w-full h-full md:w-3/5 flex flex-col md:flex-row mt-8 md:mt-0">
              {/* Instruction Nodes */}
              <div className="w-full md:w-1/2 relative h-[400px] sm:h-[500px] md:h-[600px]">
                {/* Initialize Mint - Top left position */}
                <div 
                  className={`absolute transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}
                  style={{
                    top: "5%",
                    left: "-6%",
                    width: "55%",
                    maxWidth: "300px",
                    zIndex: 3,
                    animation: mounted ? "floatNodes 15s ease-in-out infinite" : "none",
                  }}
                >
                  <div className="relative">
                    {/* Animated border */}
                    <div 
                      className="absolute -top-0.5 -left-0.5 -right-0.5 -bottom-0.5 rounded-xl z-0"
                      style={{
                        background: "linear-gradient(90deg, #5f88dc, #1cf6a0, #9945ff, #5f88dc)",
                        backgroundSize: "300% 300%",
                        animation: "border-gradient 3s ease infinite"
                      }}
                    ></div>
                    
                    {/* Instruction Node Content */}
                    <div className="relative z-10">
                      <InstructionNode 
                        id={mockInstructions.initializeMint.id}
                        name={mockInstructions.initializeMint.name}
                        description={mockInstructions.initializeMint.description}
                        status={mockInstructions.initializeMint.status}
                        accounts={mockInstructions.initializeMint.accounts}
                        inputs={mockInstructions.initializeMint.inputs}
                        codePreview={mockInstructions.initializeMint.codePreview}
                      />
                    </div>
                  </div>
                </div>

                {/* Mint To - Middle left position */}
                <div 
                  className={`absolute transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}
                  style={{
                    top: "30%",
                    left: "35%",
                    width: "50%",
                    maxWidth: "280px",
                    zIndex: 2,
                    animation: mounted ? "floatNodes2 12s ease-in-out infinite 1s" : "none",
                  }}
                >
                  <div className="relative">
                    {/* Animated border */}
                    <div 
                      className="absolute -top-0.5 -left-0.5 -right-0.5 -bottom-0.5 rounded-xl z-0"
                      style={{
                        background: "linear-gradient(90deg, #5f88dc, #1cf6a0, #9945ff, #5f88dc)",
                        backgroundSize: "300% 300%",
                        animation: "border-gradient 3s ease infinite 0.5s"
                      }}
                    ></div>
                    
                    {/* Instruction Node Content */}
                    <div className="relative z-10">
                      <InstructionNode 
                        id={mockInstructions.mintTo.id}
                        name={mockInstructions.mintTo.name}
                        description={mockInstructions.mintTo.description}
                        status={mockInstructions.mintTo.status}
                        accounts={mockInstructions.mintTo.accounts}
                        inputs={mockInstructions.mintTo.inputs}
                        codePreview={mockInstructions.mintTo.codePreview}
                      />
                    </div>
                  </div>
                </div>

                {/* Transfer - Bottom left position */}
                <div 
                  className={`absolute transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}
                  style={{
                    top: "40%",
                    left: "5%",
                    width: "50%",
                    maxWidth: "290px",
                    height: "90%",
                    zIndex: 1,
                    animation: mounted ? "floatNodes3 14s ease-in-out infinite 0.5s" : "none",
                  }}
                >
                  <div className="relative">
                    {/* Animated border */}
                    <div 
                      className="absolute -top-0.5 -left-0.5 -right-0.5 -bottom-0.5 rounded-xl z-0"
                      style={{
                        background: "linear-gradient(90deg, #5f88dc, #1cf6a0, #9945ff, #5f88dc)",
                        backgroundSize: "300% 300%",
                        animation: "border-gradient 3s ease infinite 1s"
                      }}
                    ></div>
                    
                    {/* Instruction Node Content */}
                    <div className="relative z-10">
                      <InstructionNode 
                        id={mockInstructions.transfer.id}
                        name={mockInstructions.transfer.name}
                        description={mockInstructions.transfer.description}
                        status={mockInstructions.transfer.status}
                        accounts={mockInstructions.transfer.accounts}
                        inputs={mockInstructions.transfer.inputs}
                        codePreview={mockInstructions.transfer.codePreview}
                      />
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute inset-0 z-0">
                  {/* Grid lines */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFmMjA0MCIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>

                  {/* Glowing orbs */}
                  <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-[#5580ff]/5 blur-3xl"></div>
                  <div className="absolute bottom-1/3 right-1/3 w-60 h-60 rounded-full bg-[#a855f7]/5 blur-3xl"></div>
                </div>
              </div>

              {/* Code Terminal on right side */}
              <div className="w-[100%] sm:w-[100%] h-[100%] sm:h-[100%] md:w-1/2 md:h-full flex items-center justify-center relative">
                <div className="mt-4 sm:mt-8 md:mt-0 rounded-lg overflow-hidden border border-[#2a2d4a] bg-[#0d0e1a] w-full md:w-[110%] h-[90%] absolute md:static md:transform md:translate-x-0 top-0 left-0">
                  <div className="flex items-center px-4 py-2 bg-[#1e2033] border-b border-[#2a2d4a]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#ff5f57]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#febc2e]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#28c840]"></div>
                    </div>
                    <div className="ml-4 text-[10px] sm:text-xs md:text-sm text-gray-400">token_minting_program.rs</div>
                  </div>
                  <pre className="p-2 sm:p-3 md:p-4 text-[10px] sm:text-xs md:text-sm overflow-x-auto overflow-y-auto text-gray-300">
                    <code>
                      {`use anchor_lang::prelude::*;

#[program]
pub mod token_minting_program {
    use super::*;
    
    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        params: InitializeMintParams
    ) -> Result<()> {
        instructions::initialize_mint(ctx, params)
    }
    
    pub fn mint_to(
        ctx: Context<MintTo>,
        params: MintToParams
    ) -> Result<()> {
        instructions::mint_to(ctx, params)
    }

    pub fn transfer(
        ctx: Context<Transfer>,
        amount: u64
    ) -> Result<()> {
        instructions::transfer(ctx, amount)
    }

    pub fn burn(
        ctx: Context<Burn>,
        amount: u64
    ) -> Result<()> {
        instructions::burn(ctx, amount)
    }

    pub fn freeze_account(
        ctx: Context<FreezeAccount>,
    ) -> Result<()> {
        instructions::freeze_account(ctx)
    }

    pub fn thaw_account(
        ctx: Context<ThawAccount>,
    ) -> Result<()> {
        instructions::thaw_account(ctx)
    }

    pub fn close_account(
        ctx: Context<CloseAccount>,
    ) -> Result<()> {
        instructions::close_account(ctx)
    }

    pub fn set_authority(
        ctx: Context<SetAuthority>,
        authority_type: AuthorityType,
        new_authority: Option<Pubkey>,
    ) -> Result<()> {
        instructions::set_authority(ctx, authority_type, new_authority)
    }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-[#0d0e1a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#1e2033] border border-[#2a2d4a] text-xs text-[#5580ff]">
              <span className="mr-2">⚡</span> Powerful Development Tools
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5580ff] to-[#a855f7]">
                Build. Deploy. Scale.
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              Our platform combines cutting-edge technologies to provide a secure, intelligent, and decentralized
              development experience for Solana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Feature 1 - Workflow */}
            <div className="bg-[#0a0b14] border border-[#2a2d4a] rounded-xl p-6 hover:border-[#5580ff]/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-[#5580ff]/10 flex items-center justify-center mb-4 group-hover:bg-[#5580ff]/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-[#5580ff]"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </div>
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold">Visual Workflow Builder</h3>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#1e2033] text-[#5580ff] text-xs">workflow</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Drag and drop Solana plugins to visually design your dApp architecture without writing a single line of
                code.
              </p>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#5580ff] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pre-built Solana components
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#5580ff] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Smart contract templates
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#5580ff] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Visual flow connections
                </li>
              </ul>
            </div>

            {/* Feature 2 - Code */}
            <div className="bg-[#0a0b14] border border-[#2a2d4a] rounded-xl p-6 hover:border-[#a855f7]/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-[#a855f7]/10 flex items-center justify-center mb-4 group-hover:bg-[#a855f7]/20 transition-colors">
                <Code className="w-6 h-6 text-[#a855f7]" />
              </div>
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold">Solana-Specific IDE</h3>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#1e2033] text-[#a855f7] text-xs">code</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                A powerful code editor tailored specifically for Solana development with intelligent autocompletion and
                debugging.
              </p>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#a855f7] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Rust and TypeScript support
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#a855f7] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Real-time error checking
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#a855f7] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Integrated testing tools
                </li>
              </ul>
            </div>

            {/* Feature 3 - Interface */}
            <div className="bg-[#0a0b14] border border-[#2a2d4a] rounded-xl p-6 hover:border-[#00c2ff]/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-[#00c2ff]/10 flex items-center justify-center mb-4 group-hover:bg-[#00c2ff]/20 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-[#00c2ff]"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <line x1="3" x2="21" y1="9" y2="9" />
                  <line x1="9" x2="9" y1="21" y2="9" />
                </svg>
              </div>
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold">Interactive UI Builder</h3>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#1e2033] text-[#00c2ff] text-xs">interface</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Preview and interact with your generated dApp UI in real-time as you build your Solana application.
              </p>
              <ul className="text-gray-400 space-y-2 text-sm">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#00c2ff] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Live UI previews
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#00c2ff] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Wallet integration testing
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#00c2ff] mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Responsive design tools
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-20 bg-[#0a0b14]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-[#1e2033] border border-[#2a2d4a] text-xs text-[#5580ff]">
              <span className="mr-2">▶</span> Demo
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5580ff] to-[#a855f7]">
                See FlowCode in Action
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              Watch how easy it is to build and deploy a Solana dApp in minutes with our visual development platform.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2d4a] shadow-2xl">
              {/* Video placeholder - replace with actual video embed */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d0e1a] to-[#0a0b14] flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#5580ff]/20 backdrop-blur-md flex items-center justify-center mb-4 cursor-pointer hover:bg-[#5580ff]/30 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-white"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">Click to watch demo</p>

                {/* Terminal-like code snippets */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-[#0a0b14] rounded p-2 text-xs font-mono text-[#00d16b] border border-[#2a2d4a]">
                    {"$ solana program deploy ./target/deploy/token_program.so"}
                  </div>
                  <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 -translate-y-1/2 bg-[#0a0b14] rounded p-2 text-xs font-mono text-[#a855f7] border border-[#2a2d4a]">
                    {"pub fn mint_to(ctx: Context<MintTo>, amount: u64) -> Result<()> {"}
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2 bg-[#0a0b14] rounded p-2 text-xs font-mono text-[#5580ff] border border-[#2a2d4a]">
                    {"Program deployed to: 4LQr...FvkQ"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0d0e1a] border border-[#2a2d4a] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#5580ff]/20 flex items-center justify-center mr-3">
                    <span className="text-[#5580ff] font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-sm">Design Your Workflow</h3>
                </div>
                <p className="text-gray-400 text-xs">
                  Drag and drop components to create your dApp architecture visually.
                </p>
              </div>

              <div className="bg-[#0d0e1a] border border-[#2a2d4a] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#a855f7]/20 flex items-center justify-center mr-3">
                    <span className="text-[#a855f7] font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-sm">Customize Your Code</h3>
                </div>
                <p className="text-gray-400 text-xs">
                  Fine-tune your smart contracts and frontend code in our specialized IDE.
                </p>
              </div>

              <div className="bg-[#0d0e1a] border border-[#2a2d4a] rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#00c2ff]/20 flex items-center justify-center mr-3">
                    <span className="text-[#00c2ff] font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-sm">Deploy & Monitor</h3>
                </div>
                <p className="text-gray-400 text-xs">
                  Launch your dApp to testnet or mainnet with one click and track performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-[#0d0e1a] border border-[#2a2d4a] rounded-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Background effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#5580ff] rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#a855f7] rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Ready to Build Effortlessly on Solana?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-sm">
                Join hundreds of other people on our waitlist to be informed when we launch.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-[#5580ff] hover:bg-[#4466cc] text-white px-8 rounded" asChild>
                  <Link href="/main" className="flex items-center justify-center">
                    Join The Waitlist <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Terminal-like element */}
              <div className="mt-8 max-w-md mx-auto rounded-lg overflow-hidden border border-[#2a2d4a] text-left">
                <div className="bg-[#1e2033] px-4 py-2 flex items-center">
                  <div className="flex space-x-2 mr-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                  </div>
                  <span className="text-xs text-gray-400">terminal</span>
                </div>
                <div className="bg-[#0a0b14] p-4 font-mono text-xs">
                  <p className="text-gray-400">$ solana-cli</p>
                  <p className="text-[#00d16b]">Connecting to Solana...</p>
                  <p className="text-white">✓ Connected to Solana mainnet</p>
                  <p className="text-gray-400">$ solana deploy my-token-app</p>
                  <p className="text-[#5580ff]">
                    Deploying to Solana... <span className="animate-pulse">▋</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0b14] border-t border-[#1e2033] py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 relative">
                <img src="/assets/logo.png" alt="FlowCode Logo" className="w-full h-full" />
                <div className="absolute inset-0 bg-[#5580ff]/20 blur-xl rounded-full"></div>
              </div>
              <span className="text-lg font-bold tracking-tighter">
                <span className="text-white">Solana</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5f88dc] via-[#1cf6a0] to-[#9945ff]" 
                  style={{
                    backgroundSize: "300% 300%",
                    animation: "gradientFlow 3s ease infinite"
                  }}>FlowCode</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                About
              </Link>
            </div>
            <div className="flex space-x-4">
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#1e2033]">
                <BsTelegram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#1e2033]">
                <BsTwitterX className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white hover:bg-[#1e2033]">
                <BsYoutube className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#1e2033] text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} Solana FlowCode. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes floatNodes {
          0% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(5px) translateY(4px); }
          50% { transform: translateX(-5px) translateY(2px); }
          75% { transform: translateX(2px) translateY(-2px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        
        @keyframes floatNodes2 {
          0% { transform: translateX(0px) translateY(0px); }
          33% { transform: translateX(-4px) translateY(3px); }
          66% { transform: translateX(4px) translateY(-3px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        
        @keyframes floatNodes3 {
          0% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(3px) translateY(-4px); }
          50% { transform: translateX(-5px) translateY(2px); }
          75% { transform: translateX(4px) translateY(3px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        
        @keyframes fall {
          0% { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        
        @keyframes border-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
