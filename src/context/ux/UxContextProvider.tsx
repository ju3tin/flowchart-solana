"use client";

import React, { useState, useEffect } from 'react';
import UxContext from './UxContext';
import { UxContextType, ParentTab, ActiveTab, UxOpenPanel } from './UxContextTypes';

// Default tabs when nothing is in localStorage
const defaultTabs = { 
  parentTab: 'program-builder' as ParentTab, 
  activeTab: 'code' as ActiveTab 
};

const UxContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with default values - no localStorage call at initialization
  const [parentTab, setParentTab] = useState<ParentTab>(defaultTabs.parentTab);
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTabs.activeTab);
  const [uxOpenPanel, setUxOpenPanel] = useState<UxOpenPanel>('none');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Load saved tabs from localStorage after component mounts
  useEffect(() => {
    try {
      const stored = localStorage.getItem('solaiTabs');
      if (stored) {
        const savedTabs = JSON.parse(stored) as {
          parentTab: ParentTab;
          activeTab: ActiveTab;
        };
        setParentTab(savedTabs.parentTab);
        setActiveTab(savedTabs.activeTab);
      }
    } catch (err) {
      console.error('Error reading from localStorage', err);
    }
  }, []);

  // Save to localStorage whenever tabs change
  useEffect(() => {
    try {
      const dataToStore = { parentTab, activeTab };
      localStorage.setItem('solaiTabs', JSON.stringify(dataToStore));
    } catch (err) {
      console.error('Error writing to localStorage', err);
    }
  }, [parentTab, activeTab]);

  const contextValue: UxContextType = {
    parentTab,
    setParentTab,
    activeTab,
    setActiveTab,
    uxOpenPanel,
    setUxOpenPanel,
    isChatOpen,
    setIsChatOpen,
  };

  return (
    <UxContext.Provider value={contextValue}>
      {children}
    </UxContext.Provider>
  );
};

export default UxContextProvider;
