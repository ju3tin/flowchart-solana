export type ParentTab = 'program-builder' | 'quick-actions' | 'learn';
export type ActiveTab = 'workflow' | 'interface' | 'code';
export type UxOpenPanel = 
    'none' 
  | 'sideMenu' 
  | 'projectList' 
  | 'saveProject' 
  | 'terminal' 
  | 'accountsBox';

export interface UxContextType {
  uxOpenPanel: UxOpenPanel;
  setUxOpenPanel: (panel: UxOpenPanel) => void;

  parentTab: ParentTab;
  setParentTab: (tab: ParentTab) => void;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}
