import React from 'react';

export interface User {
    id: string;
    username: string;
    org_id: string;
    orgName: string;
    openAiApiKey?: string;
    walletPublicKey?: string;
  }
  
export interface RegisterResponse {
    success: boolean;
    message: string;
    user: {
        id: string;
        username: string;
        openAiApiKey: string;
    };
}
  
  export interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (username: string, password: string) => Promise<void>;
    register: (
      orgName: string,
      username: string,
      password: string,
      code: string,
      openAiApiKey: string
    ) => Promise<RegisterResponse>;
    logout: () => void;
    firstLoginAfterRegistration: boolean;
    updateApiKey: (newApiKey: string) => Promise<void>;
    loading: boolean;
    updateWalletPublicKey: (publicKey: string) => Promise<void>;
  }