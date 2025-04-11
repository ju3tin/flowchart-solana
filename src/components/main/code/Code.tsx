import React, { useState, useContext } from 'react';
import '@xyflow/react/dist/style.css';
import { useColorModeValue } from '@/components/ui/color-mode';
import { FileTreeItemType } from '@/interfaces/FileTreeItemType';
import { FiTerminal } from "react-icons/fi";
import { Button } from '@/components/ui/button';

import CodeEditor from './CodeEditor';
import SolanaTerminal from './SolanaTerminal';

import '../../../styles/code/codeTabStyle';
    
import UxContext from '../../../context/ux/UxContext';

const Code = () => {
    const { setUxOpenPanel } = useContext(UxContext);
    const [selectedFile] = useState<FileTreeItemType | null>(null);

    const borderColor = useColorModeValue('var(--border-2-light)', 'var(--border-2-dark)');
    const codeBg = useColorModeValue('var(--code-bg-light)', 'var(--code-bg-dark)');  

    const getLanguage = (ext?: string) => {
        if (ext === "rs") return "rust";
        if (ext === "ts") return "typescript";
        return "typescript";
    };

    const terminalBg = useColorModeValue('var(--terminal-bg-light)', 'var(--terminal-bg-dark)');
    const terminalBorder = useColorModeValue('var(--border-2-light)', 'var(--border-2-dark)');
    
    return (
        <div className="flex flex-col w-full h-full overflow-x-hidden" style={{ background: codeBg }}>
            <div className="flex-[3] h-[68%]">
                <CodeEditor language={getLanguage(selectedFile?.ext)} />
            </div>
            {/* Solana Terminal */}
            <div className="flex-1" style={{ backgroundColor: '#101521' }}>
                <SolanaTerminal />
            </div>
        </div>
    )
}

export default Code;