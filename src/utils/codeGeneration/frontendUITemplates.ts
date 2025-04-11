export const MINT_FORM_TSX = `
"use client"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Loader2 } from "lucide-react"

interface MintFormProps {
  onSuccess: (txSignature: string) => void
}

export function MintForm({ onSuccess }: MintFormProps) {
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [decimals, setDecimals] = useState("9")
  const [mintAuthority, setMintAuthority] = useState("")
  const [isFreezeEnabled, setIsFreezeEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // This would normally call your API endpoint to create the token
      // For now, we'll simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate a transaction signature
      const mockTxSignature = "5Uyz2qgdkJ4VKrPQKFRrnXZj5h6WZEjwWL9Z1LZE5o6HmMdEGxpjhYJVKhgRvQdYAk9MJB2kxYBsYdFAgUB6c8Mg"
      
      // Call the success callback
      onSuccess(mockTxSignature)
    } catch (err) {
      console.error("Error creating token:", err)
      setError("Failed to create token. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tokenName">Token Name</Label>
        <Input
          id="tokenName"
          placeholder="My Awesome Token"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The full name of your token
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tokenSymbol">Token Symbol</Label>
        <Input
          id="tokenSymbol"
          placeholder="MAT"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Short ticker symbol (e.g. SOL, BTC)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="decimals">Decimals</Label>
        <Input
          id="decimals"
          type="number"
          placeholder="9"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Number of decimal places (9 is standard for most tokens)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mintAuthority">Mint Authority</Label>
        <Input
          id="mintAuthority"
          placeholder="Solana address"
          value={mintAuthority}
          onChange={(e) => setMintAuthority(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The account that will have permission to mint new tokens
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="freezeAuthority"
          checked={isFreezeEnabled}
          onChange={(e) => setIsFreezeEnabled(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <Label htmlFor="freezeAuthority">Freeze Authority</Label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enable an authority that can freeze token accounts
        </p>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Token
          </>
        ) : (
          "Create Token"
        )}
      </Button>
    </form>
  )
}
`;

export const THEME_TOGGLE_TSX = `
"use client"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = useState("light")

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light"
    setTheme(storedTheme)
    document.documentElement.classList.toggle("dark", storedTheme === "dark")
  }, [])

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
`;

export const TOKEN_CREATED_SUCCESS_TSX = `
"use client"
import { CheckCircle } from "lucide-react"
import { Button } from "./ui/button"

interface TokenCreatedSuccessProps {
  txSignature: string
  onReset: () => void
}

export function TokenCreatedSuccess({ txSignature, onReset }: TokenCreatedSuccessProps) {
  // Function to open the transaction in Solana Explorer
  const viewTransaction = () => {
    const explorerUrl = \`https://explorer.solana.com/tx/\${txSignature}?cluster=devnet\`
    window.open(explorerUrl, "_blank")
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-center text-green-800 dark:text-green-300">
        Token Created Successfully!
      </h3>
      
      <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
        Your SPL token has been created on the Solana blockchain.
      </p>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-4 w-full overflow-hidden">
        <p className="text-xs text-gray-700 dark:text-gray-300 break-all font-mono">
          {txSignature}
        </p>
      </div>
      
      <div className="flex space-x-3 w-full">
        <Button 
          onClick={viewTransaction}
          className="flex-1"
          variant="outline"
        >
          View Transaction
        </Button>
        
        <Button 
          onClick={onReset}
          className="flex-1"
        >
          Create Another Token
        </Button>
      </div>
    </div>
  )
}
`;

export const WALLET_TSX = `
"use client"
import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "./ui/button"
import { Loader2, Wallet as WalletIcon } from "lucide-react"

export function Wallet() {
  const { select, connect, disconnect, wallet, connecting, connected, publicKey } = useWallet()
  const [isClient, setIsClient] = useState(false)

  // Avoid hydration errors with Next.js
  useEffect(() => {
    setIsClient(true)
  }, [])

  async function connectWallet() {
    if (!wallet) {
      try {
        // Attempt to select the Phantom wallet
        await select('phantom')
      } catch (error) {
        console.error('Failed to select wallet:', error)
      }
    }

    try {
      await connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  if (!isClient) {
    return null
  }

  if (connected && publicKey) {
    const publicKeyString = publicKey.toBase58()
    const shortenedAddress = \`\${publicKeyString.slice(0, 5)}...\${publicKeyString.slice(-5)}\`

    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="shadow-md"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>{shortenedAddress}</span>
          </div>
        </Button>
      </div>
    )
  }

  return (
    <Button 
      className="shadow-md"
      onClick={connectWallet} 
      disabled={connecting}
    >
      {connecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting
        </>
      ) : (
        <>
          <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
        </>
      )}
    </Button>
  )
}
`;

export const HOME_PAGE_TSX = `
"use client"
import { useState } from "react"
import { MintForm } from "../components/mint-form"
import { ThemeToggle } from "../components/theme-toggle"
import { TokenCreatedSuccess } from "../components/token-created-success"
import { Wallet } from "../components/wallet"

export default function Home() {
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const handleSuccess = (signature: string) => {
    setTxSignature(signature)
  }

  const handleReset = () => {
    setTxSignature(null)
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            SolMint
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Wallet />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
              Launch your SPL token on Solana
            </h2>
            
            {txSignature ? (
              <TokenCreatedSuccess 
                txSignature={txSignature} 
                onReset={handleReset} 
              />
            ) : (
              <MintForm onSuccess={handleSuccess} />
            )}
          </div>
          
          <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Launch your own SPL token on Solana with just a few clicks.</p>
            <p className="mt-1">Fast, secure, and decentralized.</p>
          </footer>
        </div>
      </div>
    </main>
  )
}
`;

export const GLOBALS_CSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;

  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;

  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;

  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;

  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
`;

export const TAILWIND_CONFIG = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
`;

export const POSTCSS_CONFIG = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

export const BUTTON_TSX = `
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
`;

export const INPUT_TSX = `
import * as React from "react"

import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
`;

export const LABEL_TSX = `
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
`;

export const UTILS_TS = `
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`; 