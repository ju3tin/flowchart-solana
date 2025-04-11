export const thawAccountCode =
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, ThawAccount, Token, TokenAccount, Mint};
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};

#[derive(Accounts)]
pub struct ThawAccountContext<'info> {
    // The authority that can thaw token accounts (must match the mint’s freeze authority)
    #[account(mut)]
    pub authority: Signer<'info>,

    // The account to be thawed
    #[account(mut)]
    pub account: Account<'info, TokenAccount>,

    // The mint associated with the token account (must have a freeze authority set)
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ThawAccountParams {}

pub fn thaw_account_handler(
    ctx: Context<ThawAccountContext>,
    _params: ThawAccountParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let account = &ctx.accounts.account;
    let mint = &ctx.accounts.mint;
    let token_program = &ctx.accounts.token_program;

    // Construct CPI context for the SPL token thaw_account
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        ThawAccount {
            account: account.to_account_info(),
            mint: mint.to_account_info(),
            authority: authority.to_account_info(),
        },
    );

    // Thaw the token account
    token::thaw_account(cpi_ctx)?;

    // Optionally emit an event indicating the account was thawed
    emit!(AccountThawed {
        account: account.key(),
        mint: mint.key(),
    });

    Ok(())
}

#[event]
pub struct AccountThawed {
    pub account: Pubkey,
    pub mint: Pubkey,
}

#[error_code]
pub enum ThawAccountError {
    #[msg("Unauthorized attempt to thaw this account.")]
    Unauthorized,
    #[msg("Account is not frozen or cannot be thawed.")]
    NotFrozen,
}
`;
