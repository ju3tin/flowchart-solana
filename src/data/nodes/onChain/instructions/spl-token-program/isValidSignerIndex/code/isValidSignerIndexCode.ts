export const isValidSignerIndexCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::log::sol_log;
use spl_token::instruction::MIN_SIGNERS;
use spl_token::instruction::MAX_SIGNERS;

/// For demonstration, we define a context struct with no actual accounts, since we just call a helper function
#[derive(Accounts)]
pub struct IsValidSignerIndexContext<'info> {}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct IsValidSignerIndexParams {
    pub index: usize,
}

pub fn is_valid_signer_index_handler(
    _ctx: Context<IsValidSignerIndexContext>,
    params: IsValidSignerIndexParams,
) -> Result<()> {
    // We'll show how you might replicate is_valid_signer_index logic directly:
    // (This function checks if index is between MIN_SIGNERS and MAX_SIGNERS, inclusive.)
    let index = params.index;

    // You could call the actual spl_token::instruction::is_valid_signer_index if it were exposed,
    // but in typical Anchor usage, you'd replicate or check the logic yourself:
    let min_signers = MIN_SIGNERS as usize;  // e.g. 1
    let max_signers = MAX_SIGNERS as usize;  // e.g. 11

    let valid = index >= min_signers && index <= max_signers;

    // Log the result for demonstration
    sol_log(&format!("is_valid_signer_index({}) => {}", index, valid));

    // Optionally emit an event to pass the result off-chain
    emit!(SignerIndexCheckResult {
        index,
        valid,
    });

    // If you want to enforce a rule in your program logic, you can raise an error if invalid:
    if !valid {
        return err!(IsValidSignerIndexError::InvalidSignerIndex);
    }

    Ok(())
}

#[event]
pub struct SignerIndexCheckResult {
    pub index: usize,
    pub valid: bool,
}

#[error_code]
pub enum IsValidSignerIndexError {
    #[msg("The signer index is out of the allowed range (MIN_SIGNERS..=MAX_SIGNERS).")]
    InvalidSignerIndex,
}
`;
