export const approveCheckedCode = 
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, ApproveChecked, Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct ApproveCheckedContext<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub source: Account<'info, TokenAccount>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// CHECK: Delegate can be any public key
    pub delegate: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ApproveCheckedParams {
    pub amount: u64,
    pub decimals: u8,
}

pub fn approve_checked_tokens(
    ctx: Context<ApproveCheckedContext>,
    params: ApproveCheckedParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let source = &ctx.accounts.source;
    let mint = &ctx.accounts.mint;
    let delegate = &ctx.accounts.delegate;
    let token_program = &ctx.accounts.token_program;

    // CPI context for the SPL Token "approve_checked"
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        ApproveChecked {
            to: source.to_account_info(),
            mint: mint.to_account_info(),
            delegate: delegate.clone(),
            authority: authority.to_account_info(),
        },
    );

    // Approve the delegate to spend up to \`amount\` tokens, checked against \`mint\` decimals
    token::approve_checked(cpi_ctx, params.amount, params.decimals)?;

    // Optionally emit an event to notify of the successful approval
    emit!(ApprovalCheckedGranted {
        source: source.key(),
        delegate: delegate.key(),
        amount: params.amount,
        decimals: params.decimals,
    });

    Ok(())
}

#[event]
pub struct ApprovalCheckedGranted {
    pub source: Pubkey,
    pub delegate: Pubkey,
    pub amount: u64,
    pub decimals: u8,
}

#[error_code]
pub enum ApproveCheckedError {
    #[msg("Source account does not have enough tokens.")]
    InsufficientBalance,
    #[msg("Unauthorized attempt to approve delegate.")]
    Unauthorized,
}
`;
