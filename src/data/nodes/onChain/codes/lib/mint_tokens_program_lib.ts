export const mintTokensProgramLibCode = `
use anchor_lang::prelude::*;

pub mod instructions;
use instructions::*;

declare_id!("eSvgPb8NFoF5DhfNE4L7bTAvT8NtYVwFM5eZYLQHRj9");

#[program]
pub mod mint_tokens_program {
    use super::*;

    pub fn initialize_mint(ctx: Context<InitializeMintContext>, decimals: u8, mint_authority: Pubkey) -> Result<()> {
        instructions::initialize_mint::initialize_mint_handler(ctx, decimals, mint_authority)
    }

    pub fn mint_to(ctx: Context<MintToContext>, amount: u64) -> Result<()> {
        instructions::mint_to::mint_to_handler(ctx, amount)
    }
}
`;