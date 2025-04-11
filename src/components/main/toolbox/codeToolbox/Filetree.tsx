import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useColorModeValue } from '@/components/ui/color-mode';
import { FaFolder, FaChevronDown, FaRegFile, FaChevronRight } from "react-icons/fa6";
import ProjectContext from '@/context/project/ProjectContext';
import FileContext from '@/context/file/FileContext';
import { FileTreeItemType } from '@/interfaces/FileTreeItemType';

export interface FileTreeItemProps {
  item: FileTreeItemType;
  onSelectFile: (item: FileTreeItemType) => void;
  selectedItem?: FileTreeItemType;
  level: number;
}

const FileTreeItem = ({
  item,
  onSelectFile,
  selectedItem,
  level,
}: FileTreeItemProps) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const fileTreeColor = useColorModeValue('var(--filetree-color-light)', 'var(--filetree-color-dark)');

  const isSelected = selectedItem?.path === item.path;

  const isAncestorOfSelected = useMemo(() => {
    if (!selectedItem || item.type !== 'directory' || !item.path || !selectedItem.path) return false;
    return selectedItem.path.startsWith(item.path);
  }, [selectedItem, item]);

  useEffect(() => {
    if (isAncestorOfSelected) {
      setIsOpen(true);
    }
  }, [isAncestorOfSelected]);

  const hasChildren = item.type === 'directory' || (item.children?.length && item.children.length > 0);

  const toggleFolder = () => {
    if (item.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(item);
    }
  };

  return (
    <div className="flex flex-col ml-[10px]">
      <div
        className="flex items-center cursor-pointer rounded px-[10px] py-[4px]"
        style={{
          background: isSelected ? 'rgba(81,170,255,0.2)' : 'transparent'
        }}
        onClick={toggleFolder}
      >
        {hasChildren ? (
          isOpen ? <FaChevronDown size={10} color="#51545c"/> : <FaChevronRight size={10} color="#51545c"/>
        ) : (
          <FaRegFile size={12} color="#5688e8" />
        )}

        {item.type === 'directory' && <FaFolder color='#4d7cfe' className="ml-1" />}

        <span
          className="text-[0.8em] whitespace-nowrap overflow-hidden text-ellipsis ml-1"
          style={{
            color: fileTreeColor,
            maxWidth: "150px"
          }}
        >
          {item.name}
        </span>
      </div>

      {isOpen && hasChildren && (
        sortFiles(item.children ?? []).map((child) => 
          <FileTreeItem
            key={child.path}
            item={child}
            onSelectFile={onSelectFile}
            selectedItem={selectedItem}
            level={level + 1}
          />
        )
      )}
    </div>
  );
};


//// -------------------------------------------------------------------------------------------------------------------------------------------
//// -------------------------------------------------------------------------------------------------------------------------------------------
//// -------------------------------------------------------------------------------------------------------------------------------------------


const sortFiles = (files: FileTreeItemType[]) => {
  return files.sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory') return 1;
    if (a.type !== 'directory' && b.type === 'directory') return -1;
    return a.name.localeCompare(b.name);
  });
};

const FileTree = () => {
  const { projectContext } = useContext(ProjectContext);
  const { details } = projectContext;
  const { fileTree } = useContext(FileContext);
  const { selectedFile, setSelectedFile } = useContext(FileContext);

  const onSelectFile = (item: FileTreeItemType) => {
    setSelectedFile(item);
  };

  return (
    <div className="flex flex-col h-full max-w-full overflow-auto">
        <div className="flex flex-col px-0 py-[30px]" style={{ flex: 3 }}>
          {fileTree && 
            <FileTreeItem
              key={fileTree.path}
              item={fileTree}
              onSelectFile={onSelectFile}
              selectedItem={selectedFile || undefined}
              level={0}
            />
          }
        </div>
    </div>
  );
};

export default FileTree;