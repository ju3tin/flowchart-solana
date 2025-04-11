export const initSwapPoolInstruction = {
    id: 'init-swap-pool',
    type: 'instructionGroupNode',
    position: { x: 0, y: 0 },
    data: {
        label: 'Initialize Swap Pool',
        context: [
            { label: 'Swap Pool Account', value: 'Pubkey' },
            { label: 'Token A Account', value: 'Pubkey' },
            { label: 'Token B Account', value: 'Pubkey' },
            { label: 'LP Token Mint', value: 'Pubkey' },
            { label: 'Admin Account', value: 'Pubkey' },
            { label: 'Token Program', value: 'Pubkey' },
            { label: 'System Program', value: 'Pubkey' }
        ],
        inputs: [
            { label: 'Fee Rate', value: 'u64' },
            { label: 'Initial Token A Amount', value: 'u64' },
            { label: 'Initial Token B Amount', value: 'u64' }
        ],
        outputs: [
            { label: 'Swap Pool Initialized', value: 'bool' }
        ],
    },
};
