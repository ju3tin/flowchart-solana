export const burnCheckedCode =
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, BurnChecked, Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct BurnCheckedContext<'info> {
    // The authority that can burn tokens (must sign)
    #[account(mut)]
    pub authority: Signer<'info>,

    // The account holding the tokens to be burned
    #[account(mut)]
    pub account: Account<'info, TokenAccount>,

    // The mint whose tokens are to be burned (checked against the provided decimals)
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BurnCheckedParams {
    pub amount: u64,
    pub decimals: u8,
}

pub fn burn_checked_tokens(
    ctx: Context<BurnCheckedContext>,
    params: BurnCheckedParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let account = &ctx.accounts.account;
    let mint = &ctx.accounts.mint;
    let token_program = &ctx.accounts.token_program;

    // Prepare a CPI context for the SPL Token burn_checked
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        BurnChecked {
            from: account.to_account_info(),
            mint: mint.to_account_info(),
            authority: authority.to_account_info(),
        },
    );

    // Burn the specified amount of tokens, checked against the mint's decimals
    token::burn_checked(cpi_ctx, params.amount, params.decimals)?;

    // Optionally emit an event indicating tokens were burned
    emit!(BurnCheckedCompleted {
        account: account.key(),
        mint: mint.key(),
        amount: params.amount,
        decimals: params.decimals,
    });

    Ok(())
}

#[event]
pub struct BurnCheckedCompleted {
    pub account: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub decimals: u8,
}

#[error_code]
pub enum BurnCheckedError {
    #[msg("Insufficient tokens in the account to burn the requested amount.")]
    InsufficientTokens,
    #[msg("Unauthorized burn attempt.")]
    Unauthorized,
}
`;
