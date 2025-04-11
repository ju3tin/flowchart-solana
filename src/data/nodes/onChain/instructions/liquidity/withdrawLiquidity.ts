export const withdrawLiquidityInstruction = {
    id: 'withdraw-liquidity',
    type: 'instructionNode',
    position: { x: 900, y: 0 },
    data: {
        label: 'Withdraw Liquidity',
        context: [
            { label: 'Swap Pool Account', value: 'Pubkey' },
            { label: 'User LP Token Account', value: 'Pubkey' },
            { label: 'LP Token Mint', value: 'Pubkey' },
            { label: 'Token A Account', value: 'Pubkey' },
            { label: 'Token B Account', value: 'Pubkey' },
            { label: 'User Token A Account', value: 'Pubkey' },
            { label: 'User Token B Account', value: 'Pubkey' },
            { label: 'Token Program', value: 'Pubkey' }
        ],
        inputs: [
            { label: 'LP Tokens To Burn', value: 'u64' }
        ],
        outputs: [
            { label: 'Withdrawn Token A Amount', value: 'u64' },
            { label: 'Withdrawn Token B Amount', value: 'u64' }
        ],
    },
};
