// Mock data for landing page instruction nodes

export const mockInstructions = {
  initializeMint: {
    id: "2468",
    name: "Initialize Mint",
    description: "Creates and initializes a new token mint account",
    status: "Active",
    accounts: [
      {
        name: "Mint Account",
        type: "Pubkey",
        description: "The mint account to initialize"
      },
      {
        name: "Mint Authority",
        type: "Pubkey",
        description: "The authority who can mint new tokens"
      },
      {
        name: "Payer",
        type: "Pubkey",
        description: "The account paying for the transaction"
      }
    ],
    inputs: [
      {
        name: "Decimals",
        type: "u8",
        value: "9"
      }
    ],
    codePreview: `pub fn initialize_mint(
  ctx: Context<InitializeMint>,
  decimals: u8,
  mint_authority: Pubkey,
  freeze_authority: Option<Pubkey>
) -> Result<()> {
  let mint = &ctx.accounts.mint;
  let rent = &ctx.accounts.rent;
  let owner = &ctx.accounts.payer;
  
  // Initialize mint account
  initialize_mint(
    mint.to_account_info(),
    mint_authority,
    freeze_authority,
    decimals,
    rent
  )?;
  
  Ok(())
}`
  },
  
  mintTo: {
    id: "3579",
    name: "Mint To",
    description: "Mints new tokens to a specified account",
    status: "Active",
    accounts: [
      {
        name: "Mint",
        type: "Pubkey",
        description: "The mint account"
      },
      {
        name: "Destination",
        type: "Pubkey",
        description: "The token account to mint to"
      },
      {
        name: "Authority",
        type: "Pubkey",
        description: "The mint authority"
      }
    ],
    inputs: [
      {
        name: "Amount",
        type: "u64",
        value: "1000000000"
      }
    ],
    codePreview: `pub fn mint_to(
  ctx: Context<MintTo>,
  amount: u64
) -> Result<()> {
  // Transfer tokens
  let cpi_accounts = MintTo {
    mint: ctx.accounts.mint.to_account_info(),
    to: ctx.accounts.destination.to_account_info(),
    authority: ctx.accounts.authority.to_account_info(),
  };
  
  token::mint_to(
    CpiContext::new(
      ctx.accounts.token_program.to_account_info(),
      cpi_accounts
    ),
    amount
  )?;
  
  Ok(())
}`
  },
  
  transfer: {
    id: "4680",
    name: "Transfer",
    description: "Transfers tokens from one account to another",
    status: "Active",
    accounts: [
      {
        name: "Source",
        type: "Pubkey",
        description: "The source token account"
      },
      {
        name: "Destination",
        type: "Pubkey",
        description: "The destination token account"
      },
      {
        name: "Authority",
        type: "Pubkey",
        description: "The account owner"
      }
    ],
    inputs: [
      {
        name: "Amount",
        type: "u64",
        value: "500000000"
      }
    ],
    codePreview: `pub fn transfer(
  ctx: Context<Transfer>,
  amount: u64
) -> Result<()> {
  // Transfer tokens
  let cpi_accounts = Transfer {
    from: ctx.accounts.source.to_account_info(),
    to: ctx.accounts.destination.to_account_info(),
    authority: ctx.accounts.authority.to_account_info(),
  };
  
  token::transfer(
    CpiContext::new(
      ctx.accounts.token_program.to_account_info(),
      cpi_accounts
    ),
    amount
  )?;
  
  Ok(())
}`
  }
}; 
