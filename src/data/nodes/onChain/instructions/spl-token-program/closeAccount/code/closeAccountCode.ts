export const closeAccountCode =
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount};

#[derive(Accounts)]
pub struct CloseAccountContext<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    // The token account to be closed
    #[account(mut)]
    pub account: Account<'info, TokenAccount>,

    // The destination to receive the remaining SOL balance from the closed account
    /// CHECK: Can be any valid Pubkey; system account typically
    #[account(mut)]
    pub destination: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CloseAccountParams {}

pub fn close_account_handler(
    ctx: Context<CloseAccountContext>,
    _params: CloseAccountParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let account = &ctx.accounts.account;
    let destination = &ctx.accounts.destination;
    let token_program = &ctx.accounts.token_program;

    // Construct CPI context for the SPL Token close_account
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        CloseAccount {
            account: account.to_account_info(),
            destination: destination.clone(),
            authority: authority.to_account_info(),
        },
    );

    // Close the token account, sending any remaining SOL to \`destination\`
    token::close_account(cpi_ctx)?;

    // Optionally emit an event to indicate the account was closed
    emit!(AccountClosed {
        account: account.key(),
        destination: destination.key(),
    });

    Ok(())
}

#[event]
pub struct AccountClosed {
    pub account: Pubkey,
    pub destination: Pubkey,
}

#[error_code]
pub enum CloseAccountError {
    #[msg("Account cannot be closed because it still contains tokens.")]
    NonEmptyAccount,
    #[msg("Unauthorized attempt to close the account.")]
    Unauthorized,
}
`;
