export interface FlowNodePosition {
    x: number;
    y: number;
  }
  
  export interface FlowNodeField {
    label: string;
    type: string;
    value: string;
  }

  export interface FlowNodeContext {
    label: string;
    type: string;
    value: string;
    nodeId?: string;
  }

  export interface FlowNodeInput {
    label: string;
    type: string;
    value: string;
    errorText?: string;
    nodeId?: string;
  }

  export interface FlowNodeOutput {
    label: string;
    type: string;
    value: string;
    nodeId?: string;
  }
  
  export interface FlowNodeData {
    label: string;
    description?: string;
    isExpanded?: boolean;
    fields?: FlowNodeField[];
    context?: FlowNodeContext[];
    inputs?: FlowNodeInput[];
    outputs?: FlowNodeOutput[];
    accounts?: Array<{
      label: string;
      type: string;
      description?: string;
      info?: any;
    }>;
    parameters?: Array<{
      label: string;
      type: string;
      value?: string;
    }>;
    errorCodes?: Array<{
      name: string;
      message: string;
    }>;
    events?: Array<{
      name: string;
      type?: string;
      description: string;
      fields?: Array<{ name: string; type: string }>;
    }>;
    code?: string;
  }
  
  export interface FlowNode {
    id: string;
    type: string;
    position?: FlowNodePosition;
    data: FlowNodeData;
      style?: Record<string, any>;
    }
  