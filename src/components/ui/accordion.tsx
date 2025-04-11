"use client"

import React, { useState, createContext, useContext } from "react";

type AccordionContextType = {
  expanded: Record<string, boolean>;
  toggleItem: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextType | null>(null);

interface AccordionRootProps {
  children: React.ReactNode;
  type: "single" | "multiple";
  defaultValue?: string[];
}

export const AccordionRoot: React.FC<AccordionRootProps> = ({
  children,
  type,
  defaultValue = [],
}) => {
  const initialState: Record<string, boolean> = {};
  defaultValue.forEach((value) => {
    initialState[value] = true;
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialState);

  const toggleItem = (value: string) => {
    setExpanded((prev) => {
      if (type === "single") {
        const newExpanded: Record<string, boolean> = {};
        newExpanded[value] = !prev[value];
        return newExpanded;
      } else {
        return {
          ...prev,
          [value]: !prev[value],
        };
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ expanded, toggleItem }}>
      {children}
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  children,
  value,
  className,
  style,
}) => {
  const context = useContext(AccordionContext);
  
  if (!context) {
    throw new Error("AccordionItem must be used within an AccordionRoot");
  }

  const isOpen = context.expanded[value] || false;

  return (
    <div
      className={className}
      style={style}
      data-state={isOpen ? "open" : "closed"}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        // Create a new props object with the merged props
        const childProps = {
          ...(child as any).props,
          value,
          isOpen
        };
        
        return React.cloneElement(child, childProps);
      })}
    </div>
  );
};

interface AccordionItemTriggerProps {
  children: React.ReactNode;
  value?: string;
  isOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AccordionItemTrigger: React.FC<AccordionItemTriggerProps> = ({
  children,
  value,
  isOpen,
  className,
  style,
}) => {
  const context = useContext(AccordionContext);
  
  if (!context || !value) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <div
      className={className}
      style={style}
      onClick={() => context.toggleItem(value)}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </div>
  );
};

interface AccordionItemContentProps {
  children: React.ReactNode;
  value?: string;
  isOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AccordionItemContent: React.FC<AccordionItemContentProps> = ({
  children,
  isOpen,
  className,
  style,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={className} 
      style={style}
      data-state="open"
    >
      {children}
    </div>
  );
}; 