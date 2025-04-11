export const depositLiquidityInstruction = {
    id: 'deposit-liquidity',
    type: 'instructionGroupNode',
    position: { x: 300, y: 0 },
    data: {
        label: 'Deposit Liquidity',
        context: [
            { label: 'Swap Pool Account', value: 'Pubkey' },
            { label: 'Token A Account', value: 'Pubkey' },
            { label: 'Token B Account', value: 'Pubkey' },
            { label: 'User Token A Account', value: 'Pubkey' },
            { label: 'User Token B Account', value: 'Pubkey' },
            { label: 'LP Token Mint', value: 'Pubkey' },
            { label: 'User LP Token Account', value: 'Pubkey' },
            { label: 'Token Program', value: 'Pubkey' }
        ],
        inputs: [
            { label: 'Token A Amount', value: 'u64' },
            { label: 'Token B Amount', value: 'u64' }
        ],
        outputs: [
            { label: 'LP Tokens Minted', value: 'u64' }
        ],
    },
};
