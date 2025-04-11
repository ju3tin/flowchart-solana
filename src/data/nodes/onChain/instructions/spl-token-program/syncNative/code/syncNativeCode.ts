export const syncNativeCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, TokenAccount, Token};

#[derive(Accounts)]
pub struct SyncNativeContext<'info> {
    // The native token account to sync
    #[account(mut)]
    pub native_account: Account<'info, TokenAccount>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SyncNativeParams {}

pub fn sync_native_handler(
    ctx: Context<SyncNativeContext>,
    _params: SyncNativeParams,
) -> Result<()> {
    let native_account = &ctx.accounts.native_account;
    let token_program_info = &ctx.accounts.token_program;

    // Build the SPL Token sync_native instruction
    let ix: Instruction = spl_token::instruction::sync_native(
        &token_program_info.key(),
        &native_account.to_account_info().key(),
    )?;

    // Invoke the instruction on-chain
    invoke(
        &ix,
        &[
            native_account.to_account_info(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally emit an event indicating the native account has been synced
    emit!(NativeSynced {
        account: native_account.key(),
    });

    Ok(())
}

#[event]
pub struct NativeSynced {
    pub account: Pubkey,
}

#[error_code]
pub enum SyncNativeError {
    #[msg("The provided account is not a valid native token account.")]
    InvalidNativeAccount,
}
`;
