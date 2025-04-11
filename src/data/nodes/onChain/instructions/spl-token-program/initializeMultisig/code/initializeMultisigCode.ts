export const initializeMultisigCode =
`use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};
use anchor_spl::token::{self, Token};

#[derive(Accounts)]
pub struct InitializeMultisigContext<'info> {
    // The multisig account to be initialized (must be created beforehand and rent-exempt)
    #[account(mut)]
    pub multisig: AccountInfo<'info>,

    // The token program
    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeMultisigParams {
    // The public keys of all potential signers
    pub signer_pubkeys: Vec<Pubkey>,

    // The minimum number of signers required (threshold)
    pub m: u8,
}

pub fn initialize_multisig_handler(
    ctx: Context<InitializeMultisigContext>,
    params: InitializeMultisigParams,
) -> Result<()> {
    let multisig_info = &ctx.accounts.multisig;
    let token_program_info = &ctx.accounts.token_program;

    // Convert Vec<Pubkey> into &[&Pubkey] for the SPL Token instruction
    let signer_slices: Vec<&Pubkey> = params.signer_pubkeys.iter().collect();

    // Build the SPL Token initialize_multisig instruction
    let ix: Instruction = spl_token::instruction::initialize_multisig(
        &token_program_info.key(),
        &multisig_info.key(),
        &signer_slices,
        params.m,
    )?;

    // Invoke the instruction on-chain
    invoke(
        &ix,
        &[
            multisig_info.clone(),
            token_program_info.to_account_info(),
        ],
    )?;

    // Optionally, emit an event to signal the multisig is now initialized
    emit!(MultisigInitialized {
        multisig: multisig_info.key(),
        signer_pubkeys: params.signer_pubkeys.clone(),
        threshold: params.m,
    });

    Ok(())
}

#[event]
pub struct MultisigInitialized {
    pub multisig: Pubkey,
    pub signer_pubkeys: Vec<Pubkey>,
    pub threshold: u8,
}

#[error_code]
pub enum InitializeMultisigError {
    #[msg("The provided account is not rent-exempt or is already in use.")]
    InvalidMultisigAccount,
    #[msg("Invalid threshold or signers list.")]
    InvalidThresholdOrSigners,
}
`;
