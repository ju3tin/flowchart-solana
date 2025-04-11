import { initMintFlow } from "../nodes/onChain/instructions/spl-token-program/initializeMint/initMintFlow";
import { mintToFlow } from "../nodes/onChain/instructions/spl-token-program/mintTo/mintToFlow";
import { initAccountFlow } from "../nodes/onChain/instructions/spl-token-program/initializeAccount/initAccountFlow";
import { burnFlow } from "../nodes/onChain/instructions/spl-token-program/burn/burnFlow";
import { transferFlow } from "../nodes/onChain/instructions/spl-token-program/transfer/transferFlow"; 
import { amountToUiAmountFlow } from "../nodes/onChain/instructions/spl-token-program/amountToUiAmount/amountToUiAmountFlow";
import { approveFlow } from "../nodes/onChain/instructions/spl-token-program/approve/approveFlow";
import { approveCheckedFlow } from "../nodes/onChain/instructions/spl-token-program/approvedChecked/approveCheckedFlow";
import { burnCheckedFlow } from "../nodes/onChain/instructions/spl-token-program/burnChecked/burnCheckedFlow";
import { closeAccountFlow } from "../nodes/onChain/instructions/spl-token-program/closeAccount/closeAccountFlow";   
import { freezeAccountFlow } from "../nodes/onChain/instructions/spl-token-program/freezeAccount/freezeAccountFlow";
import { getAccountDataSizeFlow } from "../nodes/onChain/instructions/spl-token-program/getAccountDataSize/getAccountDataSizeFlow";
import { initializeAccount2Flow } from "../nodes/onChain/instructions/spl-token-program/initializeAccount2/initAccount2Flow";
import { initializeAccount3Flow } from "../nodes/onChain/instructions/spl-token-program/initializeAccount3/initializeAccount3Flow";
import { initializeImmutableOwnerFlow } from "../nodes/onChain/instructions/spl-token-program/initializeImmutableOwner/initializeImmutableOwnerFlow";
import { initializeMint2Flow } from "../nodes/onChain/instructions/spl-token-program/initializeMint2/initializeMint2Flow";
import { initializeMultisigFlow } from "../nodes/onChain/instructions/spl-token-program/initializeMultisig/initializeMultisigFlow";
import { initializeMultisig2Flow } from "../nodes/onChain/instructions/spl-token-program/initializeMultisig2/initializeMultisig2Flow";
import { isValidSignerIndexFlow } from "../nodes/onChain/instructions/spl-token-program/isValidSignerIndex/isValidSignerIndexFlow";
import { revokeFlow } from "../nodes/onChain/instructions/spl-token-program/revoke/revokeFlow";
import { setAuthorityFlow } from "../nodes/onChain/instructions/spl-token-program/setAuthority/setAuthorityFlow";
import { mintToCheckedFlow } from "../nodes/onChain/instructions/spl-token-program/mintToChecked/mintToCheckedFlow";
import { syncNativeFlow } from "../nodes/onChain/instructions/spl-token-program/syncNative/syncNativeFlow";
import { thawAccountFlow } from "../nodes/onChain/instructions/spl-token-program/thawAccount/thawAccountFlow";
import { transferCheckedFlow } from "../nodes/onChain/instructions/spl-token-program/transferChecked/transferCheckedFlow";
import { uiAmountToAmountFlow } from "../nodes/onChain/instructions/spl-token-program/uiAmountToAmount/uiAmountToAmountFlow"; 

export const groupedInstructions = [
    {
      label: "SPL Token Instructions",
      items: [
        {name: "amount_to_ui_amount", flow: amountToUiAmountFlow},
        {name: "approve", flow: approveFlow},
        {name: "approve_checked", flow: approveCheckedFlow},
        { name: "burn", flow: burnFlow },
        { name: "burn_checked", flow: burnCheckedFlow },
        { name: "close_account", flow: closeAccountFlow },
        {name: "freeze_account", flow: freezeAccountFlow},
        { name: "get_account_data_size", flow: getAccountDataSizeFlow },
        { name: "initialize_account", flow: initAccountFlow },
        { name: "initialize_account2", flow: initializeAccount2Flow },
        { name: "initialize_account3", flow: initializeAccount3Flow },
        { name: "initialize_immutable_owner", flow: initializeImmutableOwnerFlow },
        { name: "initialize_mint", flow: initMintFlow },
        { name: "initialize_mint2", flow: initializeMint2Flow },
        { name: "initialize_multisig", flow: initializeMultisigFlow },
        { name: "initialize_multisig2", flow: initializeMultisig2Flow },
        { name: "is_valid_signer_index", flow: isValidSignerIndexFlow },
        { name: "mint_to", flow: mintToFlow },
        { name: "mint_to_checked", flow: mintToCheckedFlow },
        { name: "revoke", flow: revokeFlow },
        { name: "set_authority", flow: setAuthorityFlow },
        { name: "sync_native", flow: syncNativeFlow },
        { name: "thaw_account", flow: thawAccountFlow },
        { name: "transfer", flow: transferFlow },
        { name: "transfer_checked", flow: transferCheckedFlow },
        { name: "ui_amount_to_amount", flow: uiAmountToAmountFlow },
      ],
    },
    {
      label: "NFT Instructions",
      items: [
        { name: "Create Metadata", flow: initMintFlow },
        { name: "Update Metadata", flow: initMintFlow },
        { name: "Create Master Edition", flow: initMintFlow },
      ],
    },
    {
      label: "DAO / Governance",
      items: [
        { name: "Create Proposal", flow: initMintFlow },
        { name: "Cast Vote", flow: initMintFlow },
        { name: "Execute Proposal", flow: initMintFlow },
      ],
    },
    {
      label: "Liquidity / DeFi",
      items: [
        { name: "Initialize Swap", flow: initMintFlow },
        { name: "Swap", flow: initMintFlow },
        { name: "Deposit Liquidity", flow: initMintFlow },
        { name: "Withdraw Liquidity", flow: initMintFlow },
      ],
    },
  ];
  