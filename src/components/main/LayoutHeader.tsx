"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";
import AuthContext from "@/context/auth/AuthContext";
import UxContext from "@/context/ux/UxContext";
import { Button } from "@/components/ui/button";
import { FaCircle } from "react-icons/fa";
import { LuWallet } from "react-icons/lu";
import { MessageSquareMore } from "lucide-react";

export default function LayoutHeader() {
  const { connected, publicKey, connect, disconnect, select } = useWallet();
  const { user } = useContext(AuthContext);
  const { isChatOpen, setIsChatOpen } = useContext(UxContext);

  const handleWalletClick = async () => {
    try {
      if (!connected) {
        await select(PhantomWalletName);
        await connect();
      } else {
        await disconnect();
      }
    } catch (error) {
      console.error("Wallet connect error:", error);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[var(--foreground-dark)] border-b border-[var(--border-2-dark)]">
      {/* Left side*/}
      <div className="flex items-center gap-2">
      <Image 
        src="/logo.png" 
        alt="Solana FlowCode" 
        width={40} 
        height={40} 
        className="rounded-md" 
      />
        <p className="text-white font-bold">Solana FlowCode</p>
      </div>

      {/* Right side: wallet connect + chat toggle */}
      <div className="flex items-center gap-2">
        {connected && publicKey ? (
          <Button
            variant="outline"
            className="h-8 rounded-full border-none px-2 flex items-center gap-2 bg-[var(--wallet-connected-bg-dark)] text-[var(--wallet-connected-color-dark)]"
            onClick={handleWalletClick}
          >
            <FaCircle size={8} color="#02DF3A" />
            {publicKey.toBase58().slice(0, 4) + "..." + publicKey.toBase58().slice(-4)}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-8 rounded-full border px-2 flex items-center gap-2 bg-[rgba(0,0,0,0.1)] text-[var(--header-fg-dark)]"
            onClick={handleWalletClick}
          >
            <LuWallet size={12} />
            Connect
          </Button>
        )}

        <Button
          variant="outline"
          className="h-8 rounded-full border-none px-2 flex items-center"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageSquareMore size={18} />
        </Button>
      </div>
    </div>
  );
} 