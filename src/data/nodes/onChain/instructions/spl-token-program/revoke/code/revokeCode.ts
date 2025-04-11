export const revokeCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, Revoke, TokenAccount, Token};

#[derive(Accounts)]
pub struct RevokeContext<'info> {
    #[account(mut)]
    pub authority: Signer<'info>, // The owner of the source account
    #[account(mut)]
    pub source: Account<'info, TokenAccount>, // The token account whose delegate is to be revoked
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RevokeParams {}

pub fn revoke_handler(
    ctx: Context<RevokeContext>,
    _params: RevokeParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let source = &ctx.accounts.source;
    let token_program_info = &ctx.accounts.token_program;

    // Build the SPL Token revoke instruction
    let ix: Instruction = spl_token::instruction::revoke(
        &token_program_info.key(),
        &source.to_account_info().key(),
        &authority.key(),
        &[],  // If additional signers are required, pass them here
    )?;

    // Invoke the instruction on-chain
    invoke(
        &ix,
        &[
            source.to_account_info(),
            authority.to_account_info(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally, emit an event to signal the delegate has been revoked
    emit!(DelegateRevoked {
        source: source.key(),
        owner: authority.key(),
    });

    Ok(())
}

#[event]
pub struct DelegateRevoked {
    pub source: Pubkey,
    pub owner: Pubkey,
}

#[error_code]
pub enum RevokeError {
    #[msg("The source account does not have a delegate to revoke.")]
    NoDelegateFound,
    #[msg("Unauthorized attempt to revoke delegate.")]
    Unauthorized,
}
`;
