export const initializeAccount3Code =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_spl::token::{self, TokenAccount, Mint, Token};

#[derive(Accounts)]
pub struct InitializeAccount3Context<'info> {
    // The token account to initialize
    #[account(mut)]
    pub account: AccountInfo<'info>,

    // The mint associated with the token account
    #[account()]
    pub mint: Account<'info, Mint>,

    // The owner of the token account
    pub owner: Signer<'info>,

    // Token program
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeAccount3Params {}

pub fn initialize_account3_handler(
    ctx: Context<InitializeAccount3Context>,
    _params: InitializeAccount3Params,
) -> Result<()> {
    let account_info = &ctx.accounts.account;
    let mint_info = &ctx.accounts.mint;
    let owner_info = &ctx.accounts.owner;
    let token_program_info = &ctx.accounts.token_program;

    // Build the SPL Token initialize_account3 instruction
    let ix: Instruction = spl_token::instruction::initialize_account3(
        &token_program_info.key(),
        &account_info.key(),
        &mint_info.key(),
        &owner_info.key(),
    )?;

    // Invoke the instruction on-chain
    invoke(
        &ix,
        &[
            account_info.clone(),
            mint_info.to_account_info(),
            owner_info.to_account_info(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally emit an event to signal the account has been initialized
    emit!(Account3Initialized {
        account: account_info.key(),
        mint: mint_info.key(),
        owner: owner_info.key(),
    });

    Ok(())
}

#[event]
pub struct Account3Initialized {
    pub account: Pubkey,
    pub mint: Pubkey,
    pub owner: Pubkey,
}

#[error_code]
pub enum InitializeAccount3Error {
    #[msg("The provided account is not rent-exempt.")]
    NotRentExempt,
    #[msg("The provided owner does not match the required authority.")]
    InvalidOwner,
}
`;
