import { initMintFlow } from "../instructions/spl-token-program/initializeMint/initMintFlow";
import { mintToFlow } from "../instructions/spl-token-program/mintTo/mintToFlow";
import { mintTokensProgramLibCode } from "../codes/lib/mint_tokens_program_lib";
import { mintTokensModCode } from "../codes/mod/mint_tokens_mod_code";

export const tokenMintProgram = {
  name: "Token Mint Program Flow",
  nodes: [...initMintFlow.nodes, ...mintToFlow.nodes],
  edges: [...initMintFlow.edges, ...mintToFlow.edges],
  code: {
    lib: mintTokensProgramLibCode,
    mod: mintTokensModCode,
    state: ``,
  }
};
