export const amountToUiAmountCode = 
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, instruction::Instruction};
use anchor_spl::token::{self, Token};

#[derive(Accounts)]
pub struct AmountToUiAmountContext<'info> {
    /// CHECK: The mint whose decimals are used
    pub mint: AccountInfo<'info>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AmountToUiAmountParams {
    pub amount: u64,
}

pub fn amount_to_ui_amount_handler(
    ctx: Context<AmountToUiAmountContext>,
    params: AmountToUiAmountParams,
) -> Result<()> {
    let mint_pubkey = ctx.accounts.mint.key();
    let token_program_id = ctx.accounts.token_program.key();
    let amount = params.amount;

    // Construct the AmountToUiAmount instruction
    let ix = spl_token::instruction::amount_to_ui_amount(
        &token_program_id,
        &mint_pubkey,
        amount,
    )?;

    // If you want to invoke this on-chain (less common):
    invoke(
        &ix,
        &[
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
    )?;

    // Optionally emit an event
    emit!(AmountToUiAmountCompleted {
        mint: mint_pubkey,
        amount,
    });

    Ok(())
}

#[event]
pub struct AmountToUiAmountCompleted {
    pub mint: Pubkey,
    pub amount: u64,
}

#[error_code]
pub enum AmountToUiAmountError {
    #[msg("Invalid mint address provided.")]
    InvalidMint,
    #[msg("Failed to convert token amount to UI amount.")]
    ConversionFailed,
}
`;
