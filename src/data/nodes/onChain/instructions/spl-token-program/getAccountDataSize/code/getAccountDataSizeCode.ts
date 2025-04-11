export const getAccountDataSizeCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, instruction::Instruction};
use anchor_spl::token::{self, Token};

#[derive(Accounts)]
pub struct GetAccountDataSizeContext<'info> {
    /// CHECK: This is the mint for which we want to retrieve the account data size
    #[account()]
    pub mint: AccountInfo<'info>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetAccountDataSizeParams {}

pub fn get_account_data_size_handler(
    ctx: Context<GetAccountDataSizeContext>,
    _params: GetAccountDataSizeParams,
) -> Result<()> {
    let mint_pubkey = ctx.accounts.mint.key();
    let token_program_id = ctx.accounts.token_program.key();

    // Build the SPL Token 'get_account_data_size' instruction
    let ix: Instruction = spl_token::instruction::get_account_data_size(
        &token_program_id,
        &mint_pubkey,
    )?;

    // Invoke the instruction. Typically, this logs or returns
    // the required data size in the transaction logs.
    invoke(
        &ix,
        &[
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
    )?;

    // Optionally emit an event, though the actual data size is not captured by Anchor
    emit!(AccountDataSizeRequested {
        mint: mint_pubkey,
    });

    Ok(())
}

#[event]
pub struct AccountDataSizeRequested {
    pub mint: Pubkey,
}

#[error_code]
pub enum GetAccountDataSizeError {
    #[msg("Invalid mint provided for data size retrieval.")]
    InvalidMint,
    #[msg("Could not retrieve the data size for the given mint.")]
    SizeRetrievalFailed,
}
`;
