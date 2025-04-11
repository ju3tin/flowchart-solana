export const approveCode = 
`use anchor_lang::prelude::*;
use anchor_spl::token::{self, Approve, TokenAccount, Token};

#[derive(Accounts)]
pub struct ApproveContext<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub source: Account<'info, TokenAccount>,

    /// CHECK: The delegate can be any account; not necessarily an Anchor account
    pub delegate: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ApproveParams {
    pub amount: u64,
}

pub fn approve_tokens(
    ctx: Context<ApproveContext>,
    params: ApproveParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let source = &ctx.accounts.source;
    let delegate = &ctx.accounts.delegate;
    let token_program = &ctx.accounts.token_program;

    // Prepare a CPI context for the SPL Token approve
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        Approve {
            to: source.to_account_info(),
            delegate: delegate.clone(),
            authority: authority.to_account_info(),
        },
    );

    // Approve the delegate to spend up to \`amount\` tokens from \`source\`
    token::approve(cpi_ctx, params.amount)?;

    // Optionally, emit an event to notify of a successful approval
    emit!(ApprovalGranted {
        source: source.key(),
        delegate: delegate.key(),
        amount: params.amount,
    });

    Ok(())
}

#[event]
pub struct ApprovalGranted {
    pub source: Pubkey,
    pub delegate: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum ApproveError {
    #[msg("Source account does not have enough tokens.")]
    InsufficientBalance,
    #[msg("Unauthorized attempt to approve delegate.")]
    Unauthorized,
}
`;
