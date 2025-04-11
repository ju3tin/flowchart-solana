export const initAccountCode = 
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::program_pack::Pack;
use anchor_spl::token::{self, spl_token, InitializeAccount, Token};

#[derive(Accounts)]
pub struct InitializeAccountContext<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: This is the new token account to initialize
    #[account(mut)]
    pub token_account: AccountInfo<'info>,

    // The mint for which we are creating this token account
    pub token_mint: Account<'info, spl_token::state::Mint>,

    #[account(address = spl_token::id())]
    pub token_program: Program<'info, Token>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeAccountParams {
    pub owner: Pubkey,
}

pub fn initialize_account(
    ctx: Context<InitializeAccountContext>,
    params: InitializeAccountParams,
) -> Result<()> {
    let payer = &ctx.accounts.payer;
    let token_account_info = &ctx.accounts.token_account;
    let token_mint = &ctx.accounts.token_mint;
    let system_program = &ctx.accounts.system_program;
    let token_program = &ctx.accounts.token_program;
    let rent = &ctx.accounts.rent;

    let owner_pubkey = params.owner;

    // Calculate required lamports and create the new token account
    let account_len = spl_token::state::Account::LEN;
    let lamports = rent.minimum_balance(account_len);

    let create_ix = system_instruction::create_account(
        &payer.key(),
        &token_account_info.key(),
        lamports,
        account_len as u64,
        &spl_token::id(),
    );

    // Invoke the system program to create the account
    anchor_lang::solana_program::program::invoke_signed(
        &create_ix,
        &[
            payer.to_account_info(),
            token_account_info.clone(),
            system_program.to_account_info(),
        ],
        &[],
    )?;

    // CPI call into the token program to initialize the token account
    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        InitializeAccount {
            account: token_account_info.clone(),
            mint: token_mint.to_account_info(),
            authority: payer.to_account_info(), // Note: The "authority" for the token::initialize_account instruction
            rent: rent.to_account_info(),
        },
    );
    token::initialize_account(cpi_ctx, &owner_pubkey)?;

    // Optionally, emit an event to signal that the account has been initialized
    emit!(AccountInitialized {
        account: token_account_info.key(),
        owner: owner_pubkey,
    });

    Ok(())
}

#[event]
pub struct AccountInitialized {
    pub account: Pubkey,
    pub owner: Pubkey,
}

#[error_code]
pub enum InitializeAccountError {
    #[msg("Token account is not owned by the Token Program.")]
    AccountNotOwnedByTokenProgram,
    #[msg("Token mint is not valid or not owned by the Token Program.")]
    MintNotOwnedByTokenProgram,
}
`;
