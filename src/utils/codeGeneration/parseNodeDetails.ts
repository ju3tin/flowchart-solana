import {
    InstructionDetail,
    StateDetail,
    LibFileDetail,
    ModFileDetail,
  } from "@/interfaces/fileDetailInterfaces";
  import { ProjectStateType } from "@/context/project/ProjectContextTypes";
  
  export function parseNodeDetails(
    projectState: ProjectStateType
  ): {
    instructions: InstructionDetail[];
    state: StateDetail[];
    lib: LibFileDetail[];
    mod: ModFileDetail;
  } {
    const { nodes, edges } = projectState;
  
    const state = parseStateDetails(nodes);
    const hasState = state.length > 0;
  
    const instructions = parseInstructionDetails(nodes, edges, hasState);
    const lib = buildLibFileDetails(instructions);
    const mod = buildModFileDetail(instructions);
  
    return { instructions, state, lib, mod };
  }
  
  function parseInstructionDetails(
    nodes: any[], 
    edges: any[], 
    hasState: boolean
  ): InstructionDetail[] {
    return nodes
      .filter((node: any) => node.type === "instructionNode" || node.type === "instructionGroupNode")
      .map((instrNode: any) => {
        const label = instrNode.data?.label || "UntitledInstruction";
  
        const snakeName = label.toLowerCase().replace(/\s+/g, "_");
  
        let pascalName = snakeName
          .split("_")
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("");
  
        let rawLogic = instrNode.data?.code || "// AI_FUNCTION_LOGIC";
  
        rawLogic = rawLogic.replace(
          /pub\s+fn\s+\w+\s*\([^)]*\)\s*->\s*Result<[^>]*>\s*\{/,
          "// REMOVED: function signature start {"
        );
  
        rawLogic = rawLogic.replace(
          /^use\s+anchor_lang::(?:prelude::)?\*?;.*$/gm,
          "// REMOVED: anchor import"
        );
  
        rawLogic = rawLogic.replace(
          /^use\s+crate::state::\*?;.*$/gm,
          "// REMOVED: state import"
        );
  
        rawLogic = rawLogic
          .replace(/\n{3,}/g, '\n\n')
          .trim();
  
        const functionLogic = rawLogic;
  
        const outgoingEdges = edges.filter((e: any) => e.source === instrNode.id);
  
        const connectedAccountNodes = outgoingEdges
          .map((edge: any) => nodes.find((n: any) => n.id === edge.target))
          .filter((maybeNode: any) => maybeNode?.type === "accountNode");
  
        const connectedInputNodes = outgoingEdges
          .map((edge: any) => nodes.find((n: any) => n.id === edge.target))
          .filter((maybeNode: any) => maybeNode?.type === "inputNode");
  
        const incomingInputNodes = edges.filter((e: any) => e.target === instrNode.id)
          .map((edge: any) => nodes.find((n: any) => n.id === edge.source))
          .filter((maybeNode: any) => maybeNode?.type === "inputNode");
  
        const connectedErrorCodesNodes = outgoingEdges
          .map((edge: any) => nodes.find((n: any) => n.id === edge.target))
          .filter((maybeNode: any) => maybeNode?.type === "errorCodesNode");
  
        const connectedEventsNodes = outgoingEdges
          .map((edge: any) => nodes.find((n: any) => n.id === edge.target))
          .filter((maybeNode: any) => maybeNode?.type === "eventsNode");
  
        const edgeAccounts = connectedAccountNodes.map((acctNode: any) => {
          return {
            name: {
              snake: acctNode.data.label?.toLowerCase().replace(/\s+/g, "_") || "my_account",
              pascal: acctNode.data.label
                ? acctNode.data.label
                    .split(" ")
                    .map((part: string) => 
                      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                    )
                    .join("")
                : "MyAccount",
            },
            type: acctNode.data?.type || "Account",
            constraints: acctNode.data?.constraints || [],
          };
        });
  
        const edgeParams = connectedInputNodes.flatMap((inputNode: any) => {
          if (Array.isArray(inputNode.data?.fields)) {
            return inputNode.data.fields.map((field: any) => ({
              name: field.label || "unnamed_param",
              type: field.type || "u64",
            }));
          }
          return [{
            name: inputNode.data?.label?.toLowerCase().replace(/\s+/g, "_") || "param",
            type: inputNode.data?.type || "u64",
          }];
        });
  
        const incomingEdgeParams = incomingInputNodes.flatMap((inputNode: any) => {
          if (Array.isArray(inputNode.data?.fields)) {
            return inputNode.data.fields.map((field: any) => ({
              name: field.label || "unnamed_param",
              type: field.type || "u64",
            }));
          }
          return [{
            name: inputNode.data?.label?.toLowerCase().replace(/\s+/g, "_") || "param",
            type: inputNode.data?.type || "u64",
          }];
        });
  
        const edgeErrorCodes = connectedErrorCodesNodes.flatMap((errorNode: any) => {
          if (Array.isArray(errorNode.data?.codes)) {
            return errorNode.data.codes.map((code: any) => ({
              name: code.name || "UnnamedError",
              msg: code.message || "An error occurred",
            }));
          }
          return errorNode.data?.name && errorNode.data?.message ? [{
            name: errorNode.data.name,
            msg: errorNode.data.message,
          }] : [];
        });
  
        const edgeEvents = connectedEventsNodes.flatMap((eventNode: any) => {
          if (Array.isArray(eventNode.data?.events)) {
            return eventNode.data.events.map((event: any) => ({
              name: event.name || "UnnamedEvent",
              fields: Array.isArray(event.fields) ? event.fields.map((field: any) => ({
                name: field.name || "unnamed_field",
                type: field.type || "String",
              })) : [],
            }));
          }
          return eventNode.data?.name ? [{
            name: eventNode.data.name,
            fields: Array.isArray(eventNode.data.fields) ? eventNode.data.fields.map((field: any) => ({
              name: field.name || "unnamed_field",
              type: field.type || "String",
            })) : [],
          }] : [];
        });
  
        const nodeAccounts = (instrNode.data?.accounts || []).map((acct: any) => ({
          name: {
            snake: acct.name?.snake || "my_account",
            pascal: acct.name?.pascal || "MyAccount",
          },
          type: acct.type || "Account",
          constraints: acct.constraints || [],
        }));
  
        const nodeParams = (instrNode.data?.params || []).map((param: any) => ({
          name: param.name,
          type: param.type,
        }));
  
        const nodeErrorCodes = (instrNode.data?.error_codes || []).map((error: any) => ({
          name: error.name,
          msg: error.message || error.msg,
        }));
  
        const nodeEvents = (instrNode.data?.events || []).map((event: any) => ({
          name: event.name || "UnnamedEvent",
          fields: Array.isArray(event.fields) ? event.fields.map((field: any) => ({
            name: field.name || "unnamed_field",
            type: field.type || "String",
          })) : [],
        }));
  
        const incomingEdges = edges.filter((e: any) => e.target === instrNode.id);
  
        let connectedContextNodes = outgoingEdges
          .map((edge: any) => nodes.find((n: any) => n.id === edge.target))
          .filter((maybeNode: any) => maybeNode?.type === "contextNode");
  
        if (connectedContextNodes.length === 0) {
          connectedContextNodes = incomingEdges
            .map((edge: any) => nodes.find((n: any) => n.id === edge.source))
            .filter((maybeNode: any) => maybeNode?.type === "contextNode");
        }
  
        let contextAccounts: any[] = [];
        if (connectedContextNodes.length > 0) {
          const contextNode = connectedContextNodes[0];
          if (Array.isArray(contextNode.data.accounts)) {
            contextAccounts = contextNode.data.accounts.map((acct: any) => {
              return {
                name: {
                  snake: acct.label?.toLowerCase().replace(/\s+/g, "_") || "my_account",
                  pascal: (acct.label || "MyAccount")
                    .split(" ")
                    .map(
                      (part: string) =>
                        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
                    )
                    .join("")
                },
                type: acct.type || "Account",
                constraints: acct.constraints || [],
              };
            });
          }
        }
  
        const incomingErrorCodesNodes = incomingEdges
          .map((edge: any) => nodes.find((n: any) => n.id === edge.source))
          .filter((maybeNode: any) => maybeNode?.type === "errorCodesNode");
  
        const incomingEventsNodes = incomingEdges
          .map((edge: any) => nodes.find((n: any) => n.id === edge.source))
          .filter((maybeNode: any) => maybeNode?.type === "eventsNode");
  
        const incomingErrorCodes = incomingErrorCodesNodes.flatMap((errorNode: any) => {
          if (Array.isArray(errorNode.data?.codes)) {
            return errorNode.data.codes.map((code: any) => ({
              name: code.name || "UnnamedError",
              msg: code.message || "An error occurred",
            }));
          }
          return errorNode.data?.name && errorNode.data?.message ? [{
            name: errorNode.data.name,
            msg: errorNode.data.message,
          }] : [];
        });
  
        const incomingEvents = incomingEventsNodes.flatMap((eventNode: any) => {
          if (Array.isArray(eventNode.data?.events)) {
            return eventNode.data.events.map((event: any) => ({
              name: event.name || "UnnamedEvent",
              fields: Array.isArray(event.fields) ? event.fields.map((field: any) => ({
                name: field.name || "unnamed_field",
                type: field.type || "String",
              })) : [],
            }));
          }
          return eventNode.data?.name ? [{
            name: eventNode.data.name,
            fields: Array.isArray(eventNode.data.fields) ? eventNode.data.fields.map((field: any) => ({
              name: field.name || "unnamed_field",
              type: field.type || "String",
            })) : [],
          }] : [];
        });
  
        const accounts = [
          ...edgeAccounts,
          ...nodeAccounts,
          ...contextAccounts
        ];
        const params = [
          ...edgeParams, 
          ...incomingEdgeParams,
          ...nodeParams
        ];
        const error_codes = [
          ...edgeErrorCodes, 
          ...nodeErrorCodes, 
          ...incomingErrorCodes
        ];
        const events = [
          ...edgeEvents, 
          ...nodeEvents, 
          ...incomingEvents
        ];
  
        const instructionDetails = {
          name: snakeName,
          doc_description: instrNode.data?.doc || "",
          context_name: `${pascalName}Context`,
          params_name: `${pascalName}Params`,
          error_enum_name: `${pascalName}Error`,
          function_logic: functionLogic,
          code: instrNode.data?.code || "",
          events,
          error_codes,
          imports: instrNode.data?.imports || [],
          accounts,
          params,
          hasState,
        } as InstructionDetail;
  
        if (snakeName === "initialize_mint") {
          instructionDetails.context_name = "InitializeMintContext";
          instructionDetails.params_name = "InitializeMintParams";
          instructionDetails.error_enum_name = "InitializeMintError";
        }
  
        return instructionDetails;
      });
  }
  
  function parseStateDetails(nodes: any[]): StateDetail[] {
    return nodes
      .filter(
        (node: any) =>
          node.type === "accountNode" &&
          node.data &&
          node.data.role === "program_account"
      )
      .map((node: any) => {
        const accountName = node.data.label || "SomeAccountData";
  
        return {
          account_name: accountName,
          struct_name: accountName.replace(/\s+/g, ""),
          role: node.data.role,
          description: `An account for ${accountName}`,
          fields: (node.data?.fields || []).map((field: any) => ({
            name: field.label || "fieldName",
            type: field.type || "u64",
            attributes: [],
          })),
        } as StateDetail;
      });
  }
  
  function buildLibFileDetails(instructions: InstructionDetail[]): LibFileDetail[] {
    return instructions.map((instr) => ({
      instruction_name: instr.name,
      context: instr.context_name,
      params: instr.params_name,
    }));
  }
  
  function buildModFileDetail(
    instructions: InstructionDetail[]
  ): ModFileDetail {
    return {
      instructions: instructions.map((instr) => instr.name),
    };
  }
  