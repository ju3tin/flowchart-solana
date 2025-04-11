export const uiAmountToAmountCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, Token};

#[derive(Accounts)]
pub struct UiAmountToAmountContext<'info> {
    /// CHECK: This is the mint whose decimals are used to convert
    pub mint: AccountInfo<'info>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UiAmountToAmountParams {
    // The UI amount as a string, e.g. "1.234567"
    pub ui_amount: String,
}

pub fn ui_amount_to_amount_handler(
    ctx: Context<UiAmountToAmountContext>,
    params: UiAmountToAmountParams,
) -> Result<()> {
    let mint_pubkey = ctx.accounts.mint.key();
    let token_program_id = ctx.accounts.token_program.key();

    // Build the SPL Token ui_amount_to_amount instruction
    let ix: Instruction = spl_token::instruction::ui_amount_to_amount(
        &token_program_id,
        &mint_pubkey,
        &params.ui_amount,
    )?;

    // Invoke the instruction on-chain. Typically, the result is logged or returned
    // in transaction logs, but Anchor itself won't directly capture the returned amount.
    invoke(
        &ix,
        &[
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
    )?;

    // Optionally emit an event to signal the conversion request was made
    emit!(UiAmountToAmountRequested {
        mint: mint_pubkey,
        ui_amount: params.ui_amount.clone(),
    });

    Ok(())
}

#[event]
pub struct UiAmountToAmountRequested {
    pub mint: Pubkey,
    pub ui_amount: String,
}

#[error_code]
pub enum UiAmountToAmountError {
    #[msg("Invalid mint provided for UI amount conversion.")]
    InvalidMint,
    #[msg("Failed to convert UI amount to base amount.")]
    ConversionFailed,
}
`;
