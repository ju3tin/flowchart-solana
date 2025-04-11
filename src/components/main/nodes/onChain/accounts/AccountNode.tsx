import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useColorModeValue } from "@/components/ui/color-mode";

// Menu imports:
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Icons
import { LuPlus, LuCheck } from "react-icons/lu";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { RiWallet3Line } from "react-icons/ri";
import "@/styles/nodes/basicNodeStyle.css";

interface FieldInputProps {
  fieldValue: string | undefined;
  onChange: (val: string) => void;
  label: string;
}

function FieldInput({ fieldValue, onChange, label }: FieldInputProps) {
  const [tempVal, setTempVal] = useState(fieldValue ?? "");

  // Pull in your existing color tokens
  const sectionMenuBorderColor = useColorModeValue(
    "var(--account-section-menu-border-light)",
    "var(--account-section-menu-border-dark)"
  );
  const sectionMenuBg = useColorModeValue(
    "var(--account-section-menu-bg-light)",
    "var(--account-section-menu-bg-dark)"
  );
  const sectionMenuColor = useColorModeValue(
    "var(--account-section-menu-color-light)",
    "var(--account-section-menu-color-dark)"
  );
  const sectionMenuInputBg = useColorModeValue(
    "var(--account-section-menu-input-bg-light)",
    "var(--account-section-menu-input-bg-dark)"
  );

  const inputColor = useColorModeValue(
    "var(--account-fields-input-color-light)",
    "var(--account-fields-input-color-dark)"
  );
  const sectionBorderColor = useColorModeValue(
    "var(--account-fields-border-light)",
    "var(--account-fields-border-dark)"
  );
  const sectionInputBg = useColorModeValue(
    "var(--account-fields-input-bg-light)",
    "var(--account-fields-input-bg-dark)"
  );
  const sectionTitleColor = useColorModeValue(
    "var(--instruction-gn-section-title-light)",
    "var(--instruction-gn-section-title-dark)"
  );

  const isAuthorityField =
    label === "Mint Authority" ||
    label === "Freeze Authority" ||
    label === "Payer";

  if (!fieldValue || fieldValue === "not set") {
    if (isAuthorityField) {
      // Render two separate buttons (Select Key, Connect)
      return (
        <div className="flex flex-row justify-between gap-1 w-full py-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full flex justify-center items-center rounded text-xs gap-1 border border-solid overflow-hidden whitespace-nowrap"
            style={{
              borderColor: sectionMenuBorderColor,
            }}
            onClick={() => onChange("")} // or open a menu, etc.
          >
            <LuPlus color="#9de19f" size={22}/>
            <span className="text-xs">Select Key</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="w-full flex justify-center items-center gap-2 rounded border border-solid text-xs"
            style={{
              borderColor: sectionMenuBorderColor,
            }}
            onClick={() => /* your connect logic */ {}}
          >
            <RiWallet3Line color="#9de19f" size={10}/>
            <span>Connect</span>
          </Button>
        </div>
      );
    } else {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className="w-full flex justify-center items-center gap-2 p-2 border border-solid rounded text-xs"
              style={{
                borderColor: sectionMenuBorderColor,
                color: sectionTitleColor,
              }}
            >
              <LuPlus color="#9de19f" />
              <span className="text-xs">Select Key</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <div className="p-2">
                <p className="text-sm mb-1">
                  Enter {label}
                </p>
                <div className="flex flex-row gap-1 w-full">
                  <Input
                    placeholder={label}
                    className="text-sm flex-1 border border-solid p-1 rounded text-xs"
                    style={{
                      borderColor: sectionMenuBorderColor,
                      backgroundColor: sectionMenuInputBg,
                    }}
                    value={tempVal}
                    onChange={(e) => setTempVal(e.target.value)}
                  />
                  <Button
                    className="border-2 border-solid rounded cursor-pointer"
                    style={{
                      borderColor: sectionMenuBorderColor,
                      backgroundColor: sectionMenuBorderColor,
                      color: sectionMenuColor,
                    }}
                    onClick={() => onChange(tempVal)}
                  >
                    <LuCheck />
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }

  // Otherwise, a normal input if the field is set
  return (
    <Input
      className="p-1 rounded border border-solid w-full text-xs"
      style={{
        borderColor: sectionMenuBorderColor,
        backgroundColor: sectionInputBg,
      }}
      value={fieldValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
    />
  );
}

interface NodeData {
  label: string;
  isExpanded?: boolean;
  fields?: any[];
}

export function AccountNode({ data }: { data: NodeData }) {
  const [expanded, setExpanded] = useState(data.isExpanded ?? false);

  // Just read from data
  const fields = data.fields || [];

  // Node background/border colors
  const bg = useColorModeValue(
    "var(--account-bg-light)",
    "var(--account-bg-dark)"
  );
  const accentColor = useColorModeValue(
    "var(--account-accent-color-light)",
    "var(--account-accent-color-dark)"
  );

  const headerColor = useColorModeValue(
    "var(--base-node-header-color-light)",
    "var(--base-node-header-color-dark)"
  );
  const sectionBg = useColorModeValue(
    "var(--instruction-gn-section-bg-light)",
    "var(--instruction-gn-section-bg-dark)"
  );
  const sectionBorderColor = useColorModeValue(
    "var(--account-fields-border-light)",
    "var(--account-fields-border-dark)"
  );
  const sectionTitleColor = useColorModeValue(
    "var(--instruction-gn-section-title-light)",
    "var(--instruction-gn-section-title-dark)"
  );
  const fieldLabelColor = useColorModeValue(
    "var(--instruction-gn-field-label-light)",
    "var(--instruction-gn-field-label-dark)"
  );
  const typeBadgeBg = useColorModeValue(
    "var(--instruction-gn-type-badge-bg-light)",
    "var(--instruction-gn-type-badge-bg-dark)"
  );
  const typeBadgeColor = useColorModeValue(
    "var(--instruction-gn-type-badge-color-light)",
    "var(--instruction-gn-type-badge-color-dark)"
  );

  return (
    <div className="bg-transparent" style={{ background: bg, borderColor: accentColor }}>
      {/* Header */}
      <div
        className="flex flex-1 items-center justify-between rounded-t-lg p-2 pb-0"
        style={{
          borderColor: accentColor,
        }}
      >
        <div className="flex items-center">
          <p style={{ color: headerColor }}>
            {data.label}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="p-2 cursor-pointer z-[1000]"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <FaChevronUp size={20} color={accentColor}/>
          ) : (
            <FaChevronDown size={20} color={accentColor}/>
          )}
        </Button>
      </div>

      {/* Expanded fields */}
      {expanded && (
        <div
          className="flex flex-col p-5 gap-4"
        >
          {/* Fields section */}
          {fields?.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex">
                <p style={{ color: sectionTitleColor }}>Fields</p>
              </div>

              <div
                className="nodrag"
                style={{
                  borderColor: sectionBorderColor,
                  backgroundColor: sectionBg
                }}
              >
                <div className="flex flex-col w-full gap-2">
                  {fields.map((field: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="flex flex-row justify-between w-full"
                      >
                        {/* Field label */}
                        <p style={{ color: fieldLabelColor }}>
                          {field.label}
                        </p>

                        {/* Type Badge */}
                        <Badge
                          className="rounded"
                          style={{
                            background: typeBadgeBg,
                            color: typeBadgeColor,
                          }}
                        >
                          {field.type || "N/A"}
                        </Badge>
                      </div>

                      {/* Generic FieldInput */}
                      <div className="flex-1 w-full">
                        <FieldInput
                          label={field.label}
                          fieldValue={field.value}
                          onChange={(newVal) => {
                            // Optionally do nothing or call a parent callback:
                            // data.onFieldChange?.(index, newVal);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ReactFlow Handles */}
      <Handle id="a-acc" type="source" position={Position.Top} />
      <Handle id="b-acc" type="source" position={Position.Right} />
      <Handle id="c-acc" type="source" position={Position.Bottom} />
      <Handle id="d-acc" type="target" position={Position.Left} />
    </div>
  );
}
