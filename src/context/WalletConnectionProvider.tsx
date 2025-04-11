import React, { FC, ReactNode, useMemo } from 'react';
import { 
  WalletProvider, 
  ConnectionProvider 
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter
} from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletConnectionProviderProps {
  children: ReactNode;
}

export const WalletConnectionProvider: FC<WalletConnectionProviderProps> = ({ children }) => {
  const network = 'devnet';
  const endpoint = `https://api.${network}.solana.com`;

  const wallets = useMemo(() => [ new PhantomWalletAdapter() ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
