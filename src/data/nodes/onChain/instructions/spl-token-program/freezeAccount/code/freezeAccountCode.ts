export const freezeAccountCode =
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, FreezeAccount, Token, TokenAccount, Mint};

#[derive(Accounts)]
pub struct FreezeAccountContext<'info> {
    // The authority allowed to freeze accounts (must match the mint’s freeze authority)
    #[account(mut)]
    pub authority: Signer<'info>,

    // The account to be frozen
    #[account(mut)]
    pub account: Account<'info, TokenAccount>,

    // The mint associated with the token account
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct FreezeAccountParams {}

pub fn freeze_account_handler(
    ctx: Context<FreezeAccountContext>,
    _params: FreezeAccountParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let account = &ctx.accounts.account;
    let mint = &ctx.accounts.mint;
    let token_program = &ctx.accounts.token_program;

    // CPI context for the SPL token freeze_account
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        FreezeAccount {
            account: account.to_account_info(),
            mint: mint.to_account_info(),
            authority: authority.to_account_info(),
        },
    );

    // Freeze the token account
    token::freeze_account(cpi_ctx)?;

    // Optionally emit an event indicating the account was frozen
    emit!(AccountFrozen {
        account: account.key(),
        mint: mint.key(),
    });

    Ok(())
}

#[event]
pub struct AccountFrozen {
    pub account: Pubkey,
    pub mint: Pubkey,
}

#[error_code]
pub enum FreezeAccountError {
    #[msg("Unauthorized attempt to freeze this account.")]
    Unauthorized,
    #[msg("Account is already frozen or cannot be frozen.")]
    AlreadyFrozen,
}
`;
