export const mintToCheckedCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, TokenAccount, Token};

#[derive(Accounts)]
pub struct MintToCheckedContext<'info> {
    #[account(mut)]
    pub authority: Signer<'info>, // The authority allowed to mint
    #[account(mut)]
    pub mint: AccountInfo<'info>, // The mint whose tokens are being minted
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>, // The account receiving the newly minted tokens
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintToCheckedParams {
    pub amount: u64,
    pub decimals: u8,
}

pub fn mint_to_checked_handler(
    ctx: Context<MintToCheckedContext>,
    params: MintToCheckedParams,
) -> Result<()> {
    let authority = &ctx.accounts.authority;
    let mint_info = &ctx.accounts.mint;
    let destination = &ctx.accounts.destination;
    let token_program_info = &ctx.accounts.token_program;

    // Build the SPL Token mint_to_checked instruction
    let ix: Instruction = spl_token::instruction::mint_to_checked(
        &token_program_info.key(),
        &mint_info.key(),
        &destination.to_account_info().key(),
        &authority.key(),
        &[], // Additional signers if needed
        params.amount,
        params.decimals,
    )?;

    // Invoke the instruction on-chain
    invoke(
        &ix,
        &[
            mint_info.clone(),
            destination.to_account_info(),
            authority.to_account_info(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally emit an event to signal successful minting
    emit!(TokensMintedChecked {
        mint: mint_info.key(),
        destination: destination.key(),
        amount: params.amount,
        decimals: params.decimals,
    });

    Ok(())
}

#[event]
pub struct TokensMintedChecked {
    pub mint: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub decimals: u8,
}

#[error_code]
pub enum MintToCheckedError {
    #[msg("Unauthorized to mint new tokens.")]
    Unauthorized,
    #[msg("Invalid decimals for this mint.")]
    InvalidDecimals,
}
`;
