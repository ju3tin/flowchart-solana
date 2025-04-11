export const mintToCode = `
use anchor_lang::prelude::*;
use anchor_spl::token::{
    self,
    spl_token,
    Token,
    MintTo,
};

#[derive(Accounts)]
pub struct MintToContext<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    /// CHECK: This is the mint account
    #[account(mut)]
    pub token_mint: AccountInfo<'info>,

    /// CHECK: This is the destination token account
    #[account(mut)]
    pub destination_token_account: AccountInfo<'info>,

    #[account(address = spl_token::id())]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintToParams {
    pub amount: u64,
}

pub fn mint_to(
    ctx: Context<MintToContext>,
    params: MintToParams,
) -> Result<()> {
    let token_program = &ctx.accounts.token_program;
    let token_mint_info = &ctx.accounts.token_mint;
    let destination_account_info = &ctx.accounts.destination_token_account;
    let mint_authority = &ctx.accounts.mint_authority;

    if token_mint_info.owner != &spl_token::id() {
        return err!(MintToError::MintNotOwnedByTokenProgram);
    }
    if destination_account_info.owner != &spl_token::id() {
        return err!(MintToError::DestinationNotOwnedByTokenProgram);
    }

    let cpi_ctx = CpiContext::new(
        token_program.to_account_info(),
        MintTo {
            mint: token_mint_info.clone(),
            to: destination_account_info.clone(),
            authority: mint_authority.to_account_info(),
        },
    );

    token::mint_to(cpi_ctx, params.amount)?;

    // Optionally emit an event to signal that tokens have been minted
    emit!(TokensMinted {
        mint_authority: mint_authority.key(),
        amount: params.amount,
    });

    Ok(())
}

#[event]
pub struct TokensMinted {
    pub mint_authority: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum MintToError {
    #[msg("Mint account is not owned by the Token Program.")]
    MintNotOwnedByTokenProgram,
    #[msg("Destination account is not owned by the Token Program.")]
    DestinationNotOwnedByTokenProgram,
}
`;
