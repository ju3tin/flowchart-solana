export const initializeImmutableOwnerCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, instruction::Instruction};
use anchor_spl::token::{self, TokenAccount, Token};

#[derive(Accounts)]
pub struct InitializeImmutableOwnerContext<'info> {
    // The token account to mark as having an immutable owner
    #[account(mut)]
    pub account: AccountInfo<'info>,

    // Token program
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeImmutableOwnerParams {}

pub fn initialize_immutable_owner_handler(
    ctx: Context<InitializeImmutableOwnerContext>,
    _params: InitializeImmutableOwnerParams,
) -> Result<()> {
    let account_info = &ctx.accounts.account;
    let token_program_info = &ctx.accounts.token_program;

    // Build the instruction for initialize_immutable_owner
    let ix: Instruction = spl_token::instruction::initialize_immutable_owner(
        &token_program_info.key(),
        &account_info.key(),
    )?;

    // Invoke the instruction
    invoke(
        &ix,
        &[
            account_info.clone(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally, emit an event to signal the account's ownership is now immutable
    emit!(ImmutableOwnerInitialized {
        account: account_info.key(),
    });

    Ok(())
}

#[event]
pub struct ImmutableOwnerInitialized {
    pub account: Pubkey,
}

#[error_code]
pub enum InitializeImmutableOwnerError {
    #[msg("Unable to mark the owner as immutable because the account is invalid or not rent exempt.")]
    InvalidAccount,
}
`;
