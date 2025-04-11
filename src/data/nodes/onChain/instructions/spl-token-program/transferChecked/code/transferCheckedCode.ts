export const transferCheckedCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, TokenAccount, Token, Mint};

#[derive(Accounts)]
pub struct TransferCheckedContext<'info> {
    // The authority who can transfer tokens from the source
    #[account(mut)]
    pub authority: Signer<'info>,

    // The source token account
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,

    // The mint associated with the tokens being transferred
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    // The destination token account
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TransferCheckedParams {
    pub amount: u64,
    pub decimals: u8,
}

pub fn transfer_checked_handler(
    ctx: Context<TransferCheckedContext>,
    params: TransferCheckedParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let source = &ctx.accounts.source;
    let mint = &ctx.accounts.mint;
    let destination = &ctx.accounts.destination;
    let token_program_info = &ctx.accounts.token_program;

    // Build the SPL Token transfer_checked instruction
    let ix: Instruction = spl_token::instruction::transfer_checked(
        &token_program_info.key(),
        &source.to_account_info().key(),
        &mint.to_account_info().key(),
        &destination.to_account_info().key(),
        &authority.key(),
        &[], // Additional signers if needed
        params.amount,
        params.decimals,
    )?;

    // Invoke the instruction on-chain
    invoke(
        &ix,
        &[
            source.to_account_info(),
            mint.to_account_info(),
            destination.to_account_info(),
            authority.to_account_info(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally emit an event indicating the transfer was completed
    emit!(TransferCheckedCompleted {
        source: source.key(),
        destination: destination.key(),
        amount: params.amount,
        decimals: params.decimals,
    });

    Ok(())
}

#[event]
pub struct TransferCheckedCompleted {
    pub source: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub decimals: u8,
}

#[error_code]
pub enum TransferCheckedError {
    #[msg("Insufficient funds in the source account.")]
    InsufficientFunds,
    #[msg("Unauthorized attempt to transfer tokens.")]
    Unauthorized,
    #[msg("Decimals provided do not match the mint's decimals.")]
    InvalidDecimals,
}
`;
