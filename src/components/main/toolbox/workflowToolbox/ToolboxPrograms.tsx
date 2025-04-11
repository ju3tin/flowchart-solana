import React from 'react';

export const ToolboxPrograms = () => {
    const programs = [
        {
            name: 'SPL Token',
            id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            icon: 'T',
            color: 'blue',
            description: 'Fungible and Non-Fungible Token Interface'
        },
        {
            name: 'SPL Associated Token',
            id: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
            icon: 'A',
            color: 'blue',
            description: 'Create and manage associated token accounts'
        },
        {
            name: 'Metaplex Token Metadata',
            id: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
            icon: 'M',
            color: 'purple',
            description: 'Create and manage token metadata'
        },
        {
            name: 'System Program',
            id: '11111111111111111111111111111111',
            icon: 'S',
            color: 'green',
            description: 'Create accounts, transfer SOL, etc.'
        }
    ];

    return (
        <div className="space-y-3">
            {programs.map(program => (
                <div key={program.id} className="bg-[#1e1e20] border border-[#2a2a2d] rounded-md p-3 hover:border-[#4d7cfe]/30 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3">
                        <div className={`h-6 w-6 rounded bg-${program.color}-500 flex items-center justify-center text-xs font-bold text-white`}>
                            {program.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-white">{program.name}</h3>
                            <p className="text-xs text-[#6e6e76] mt-1">{program.description}</p>
                            <div className="mt-2">
                                <p className="text-xs text-[#6e6e76] font-mono truncate">{program.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};