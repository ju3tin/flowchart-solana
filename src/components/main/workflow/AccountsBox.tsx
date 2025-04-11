import React from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface SolanaAccount {
  id: string;
  address: string;
  balance: string;
  type: string;
  status: 'active' | 'pending' | 'inactive';
}

interface AccountsBoxProps {
  accounts?: SolanaAccount[];
}

const dummyAccounts: SolanaAccount[] = [
  {
    id: '1',
    address: 'GkUL2xVqezKCM8rHmXSJyGbFmxRPg98Lk3c5JgG7KxZ',
    balance: '1000 SOL',
    type: 'Token Account',
    status: 'active',
  },
  {
    id: '2',
    address: 'Hj9KpWsVBhfxjYqkQJ1MhkVZx9uX7hVz6QV5iNBMbTn',
    balance: '500 SOL',
    type: 'Token Account',
    status: 'inactive',
  },
];

function getStatusColors(status: SolanaAccount['status']) {
  switch (status) {
    case 'active':
      return { bg: 'bg-green-600', text: 'text-white' };
    case 'pending':
      return { bg: 'bg-yellow-500', text: 'text-black' };
    case 'inactive':
    default:
      return { bg: 'bg-gray-500', text: 'text-white' };
  }
}

export const AccountsBox: React.FC<AccountsBoxProps> = ({ accounts = dummyAccounts }) => {
  return (
    <div 
      className="bg-gradient-to-b from-[#1A1F2E] to-[#141519] border border-[#2A3347] rounded-lg w-[320px] shadow-xl backdrop-blur-md"
    >
      <div
        className="p-3 border-b border-[#2A3347]"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#E9ECEF]">
            Solana Accounts
          </span>

          <span
            className="bg-[#1d1e2a] text-[#0ea5e9] border border-[#0ea5e930] text-[0.7rem] px-2 py-0.5 rounded-full"
          >
            {accounts.length} Active
          </span>
        </div>
      </div>

      {accounts.map((account, idx) => {
        const statusColors = getStatusColors(account.status);

        return (
          <div key={account.id}>
            {idx > 0 && (
              <div className="border-t border-[#2A3347]" />
            )}
            <div
              className="p-3 hover:bg-[#2A3347] transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#0ea5e9]" />
                  <span className="text-sm font-medium text-[#E9ECEF]">
                    Account #{account.id}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    aria-label="Copy address"
                    className="p-1 rounded text-[#A0AEC0] hover:text-[#E9ECEF] hover:bg-[#232B3F]"
                    title="Copy address"
                  >
                    <FiCopy size={14} />
                  </button>
                  <button
                    aria-label="View on Explorer"
                    className="p-1 rounded text-[#A0AEC0] hover:text-[#E9ECEF] hover:bg-[#232B3F]"
                    title="View on Explorer"
                  >
                    <FiExternalLink size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#A0AEC0]">Address</span>
                <span className="font-mono text-[#E9ECEF] max-w-[160px] truncate">
                  {account.address}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#A0AEC0]">Balance</span>
                <span className="text-[#E9ECEF]">{account.balance}</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#A0AEC0]">Type</span>
                <span className="text-[#E9ECEF]">{account.type}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A0AEC0]">Status</span>
                <span
                  className={cn(
                    "text-[0.65rem] px-1.5 py-0.5 rounded-full border",
                    statusColors.bg,
                    statusColors.text,
                    `border-${statusColors.bg}/30`
                  )}
                >
                  {account.status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 