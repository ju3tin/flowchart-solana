export const burnCode = 
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct BurnContext<'info> {
    // The authority that can burn tokens (must sign)
    #[account(mut)]
    pub authority: Signer<'info>,

    // The account holding the tokens to be burned
    #[account(mut)]
    pub account: Account<'info, TokenAccount>,

    // The mint whose tokens are to be burned
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BurnParams {
    pub amount: u64,
}

pub fn burn_tokens(
    ctx: Context<BurnContext>,
    params: BurnParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let account = &ctx.accounts.account;
    let mint = &ctx.accounts.mint;
    let token_program = &ctx.accounts.token_program;

    // Prepare a CPI context for the SPL Token burn
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        Burn {
            from: account.to_account_info(),
            mint: mint.to_account_info(),
            authority: authority.to_account_info(),
        },
    );

    // Burn the specified amount of tokens
    token::burn(cpi_ctx, params.amount)?;

    // Optionally emit an event to notify off-chain listeners
    emit!(BurnCompleted {
        account: account.key(),
        mint: mint.key(),
        amount: params.amount,
    });

    Ok(())
}

#[event]
pub struct BurnCompleted {
    pub account: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum BurnError {
    #[msg("Insufficient tokens in the account to burn the requested amount.")]
    InsufficientTokens,
    #[msg("Unauthorized burn attempt.")]
    Unauthorized,
}
`;
