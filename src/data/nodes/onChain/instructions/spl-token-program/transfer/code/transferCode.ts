export const transferCode =
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, Token, TokenAccount};

#[derive(Accounts)]
pub struct TransferContext<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TransferParams {
    pub amount: u64,
}

pub fn transfer_tokens(
    ctx: Context<TransferContext>,
    params: TransferParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let source = &ctx.accounts.source;
    let destination = &ctx.accounts.destination;
    let token_program = &ctx.accounts.token_program;

    // Create a CPI context for the SPL transfer
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        Transfer {
            from: source.to_account_info(),
            to: destination.to_account_info(),
            authority: authority.to_account_info(),
        },
    );

    // Perform the SPL token transfer
    token::transfer(cpi_ctx, params.amount)?;

    // Optionally, emit an event indicating that the transfer completed
    emit!(TransferCompleted {
        source: source.key(),
        destination: destination.key(),
        amount: params.amount,
    });

    Ok(())
}

#[event]
pub struct TransferCompleted {
    pub source: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum TransferError {
    #[msg("Insufficient funds in source account.")]
    InsufficientFunds,
    #[msg("Unauthorized transfer attempt.")]
    Unauthorized,
}
`;
