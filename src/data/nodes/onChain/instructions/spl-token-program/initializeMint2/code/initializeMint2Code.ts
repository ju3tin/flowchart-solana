export const initializeMint2Code =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, instruction::Instruction};
use anchor_spl::token::{self, Mint, Token};

#[derive(Accounts)]
pub struct InitializeMint2Context<'info> {
    // The mint account to initialize
    #[account(mut)]
    pub mint: AccountInfo<'info>,

    // The authority who can mint new tokens
    pub mint_authority: Signer<'info>,

    // Token program
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeMint2Params {
    pub decimals: u8,
    pub freeze_authority: Option<Pubkey>,
}

pub fn initialize_mint2_handler(
    ctx: Context<InitializeMint2Context>,
    params: InitializeMint2Params,
) -> Result<()> {
    let mint_info = &ctx.accounts.mint;
    let mint_authority = &ctx.accounts.mint_authority;
    let token_program_info = &ctx.accounts.token_program;

    // If the freeze authority is Some(pubkey), we pass it; otherwise None.
    let freeze_authority_pubkey = params.freeze_authority.as_ref();

    // Build the SPL Token initialize_mint2 instruction
    let ix: Instruction = spl_token::instruction::initialize_mint2(
        &token_program_info.key(),
        &mint_info.key(),
        &mint_authority.key(),
        freeze_authority_pubkey,
        params.decimals,
    )?;

    // Invoke the instruction on-chain
    invoke(
        &ix,
        &[
            mint_info.clone(),
            mint_authority.to_account_info(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally emit an event to signal the mint is initialized
    emit!(Mint2Initialized {
        mint: mint_info.key(),
        mint_authority: mint_authority.key(),
        freeze_authority: freeze_authority_pubkey.copied(),
        decimals: params.decimals,
    });

    Ok(())
}

#[event]
pub struct Mint2Initialized {
    pub mint: Pubkey,
    pub mint_authority: Pubkey,
    pub freeze_authority: Option<Pubkey>,
    pub decimals: u8,
}

#[error_code]
pub enum InitializeMint2Error {
    #[msg("The mint account is not rent-exempt.")]
    NotRentExempt,
    #[msg("Unauthorized to initialize this mint.")]
    Unauthorized,
}
`;
