export const setAuthorityCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, AuthorityType, Token};

#[derive(Accounts)]
pub struct SetAuthorityContext<'info> {
    // The current authority who can change the authority of 'owned'
    #[account(mut)]
    pub current_authority: Signer<'info>,

    // The account or mint whose authority will be changed
    #[account(mut)]
    pub owned: AccountInfo<'info>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

/// A helper enum to match SPL Token's AuthorityType
#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum CustomAuthorityType {
    MintTokens,
    FreezeAccount,
    AccountOwner,
    CloseAccount,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SetAuthorityParams {
    // The new authority, or None to remove the authority
    pub new_authority: Option<Pubkey>,

    // Which authority type (MintTokens, FreezeAccount, etc.) to set
    pub authority_type: CustomAuthorityType,
}

pub fn set_authority_handler(
    ctx: Context<SetAuthorityContext>,
    params: SetAuthorityParams,
) -> Result<()> {
    let current_authority = &ctx.accounts.current_authority;
    let owned = &ctx.accounts.owned;
    let token_program_info = &ctx.accounts.token_program;

    // Convert our CustomAuthorityType to anchor_spl::token::AuthorityType
    let authority_type = match params.authority_type {
        CustomAuthorityType::MintTokens => AuthorityType::MintTokens,
        CustomAuthorityType::FreezeAccount => AuthorityType::FreezeAccount,
        CustomAuthorityType::AccountOwner => AuthorityType::AccountOwner,
        CustomAuthorityType::CloseAccount => AuthorityType::CloseAccount,
    };

    // Build the SPL Token set_authority instruction
    let ix: Instruction = spl_token::instruction::set_authority(
        &token_program_info.key(),
        &owned.key(),
        params.new_authority.as_ref(),
        authority_type,
        &current_authority.key(),
        &[], // Add more signers if needed
    )?;

    // Invoke the instruction
    invoke(
        &ix,
        &[
            owned.clone(),
            current_authority.to_account_info(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally emit an event to indicate the authority has changed
    emit!(AuthoritySet {
        owned: owned.key(),
        new_authority: params.new_authority,
        authority_type: authority_type as u8,
    });

    Ok(())
}

#[event]
pub struct AuthoritySet {
    pub owned: Pubkey,
    pub new_authority: Option<Pubkey>,
    /// We store authority_type as a raw u8 for demonstration
    pub authority_type: u8,
}

#[error_code]
pub enum SetAuthorityError {
    #[msg("Unauthorized to set this authority.")]
    Unauthorized,
    #[msg("Invalid authority type specified.")]
    InvalidAuthorityType,
}
`;
