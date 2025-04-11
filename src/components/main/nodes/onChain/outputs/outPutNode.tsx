import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useColorModeValue } from "@/components/ui/color-mode";

interface OutputItem {
  label: string;
  type: string;
  value: string | boolean;
  errorText?: string;
}

interface OutputNodeData {
  label: string;
  outputs?: OutputItem[];
}

// Simple Field component implementation
const Field = ({ 
  label, 
  invalid, 
  errorText, 
  children 
}: { 
  label: string; 
  invalid?: boolean; 
  errorText?: string; 
  children: React.ReactNode 
}) => (
  <div className="mb-3">
    <div className="text-xs mb-1">{label}</div>
    {children}
    {invalid && errorText && (
      <div className="text-xs text-red-500 mt-1">{errorText}</div>
    )}
  </div>
);

export function OutputNode({ data }: { data: OutputNodeData }) {
  const nodeBg = useColorModeValue("var(--output-node-bg-light)", "var(--output-node-bg-dark)");
  const nodeColor = useColorModeValue("var(--output-node-color-light)", "var(--output-node-color-dark)");
  const nodeInputBg = useColorModeValue("var(--output-node-input-bg-light)", "var(--output-node-input-bg-dark)");
  const nodeInputFg = useColorModeValue("var(--output-node-input-fg-light)", "var(--output-node-input-fg-dark)");
  const nodeInputBorder = useColorModeValue("var(--output-node-input-border-light)", "var(--output-node-input-border-dark)");

  return (
    <div className="output-node" style={{ background: nodeBg }}>
      <Card className="border-0 bg-transparent">
        <CardHeader className="p-2">
          <h3 className="text-sm font-medium" style={{ color: nodeColor }}>
            {data.label}
          </h3>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          {data.outputs?.map((output, index) => (
            <div key={index}>
              {/* Render different types of outputs based on type */}
              {output.type === "account" ? (
                <Field label={output.label} invalid={false} errorText={output.errorText}>
                  <Input 
                    className="w-full"
                    style={{
                      background: nodeInputBg,
                      color: nodeInputFg,
                      borderColor: nodeInputBorder
                    }}
                    value={output.value as string}
                    readOnly
                  />
                </Field>
              ) : output.type === "boolean" ? (
                <p className="text-sm" style={{ color: nodeColor }}>
                  {output.value ? "✔️ Yes" : "❌ No"}
                </p>
              ) : (
                <p className="text-sm" style={{ color: nodeColor }}>
                  {output.label}: {output.value}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Left-side Handle (to receive connections from instruction node) */}
      <Handle id="d" type="target" position={Position.Left} />
    </div>
  );
}
