import React, { useState, useEffect, useContext } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import { IoSettingsSharp } from "react-icons/io5";
import { codeEditorHeader, settingsMenuItem, settingsMenuThemeTrigger } from "../../../styles/code/codeStyle";
import "@/styles/code/codeStyles.css";

import CodeMirror from "@uiw/react-codemirror";
import { rust } from "@codemirror/lang-rust";
import { javascript } from "@codemirror/lang-javascript";

// Themes
import { basicLight, basicDark } from '@uiw/codemirror-theme-basic';
import { consoleLight, consoleDark } from '@uiw/codemirror-theme-console';
import { duotoneLight, duotoneDark } from '@uiw/codemirror-theme-duotone';

import { materialDark, materialDarkInit } from "@uiw/codemirror-theme-material";
import { gruvboxDark, gruvboxDarkInit, gruvboxLight, gruvboxLightInit } from "@uiw/codemirror-theme-gruvbox-dark";
import { solarizedLight, solarizedDark, solarizedLightInit, solarizedDarkInit } from "@uiw/codemirror-theme-solarized";
import { githubLight, githubLightInit, githubDark, githubDarkInit } from '@uiw/codemirror-theme-github';
import { whiteLight, whiteLightInit, whiteDark, whiteDarkInit } from '@uiw/codemirror-theme-white';
import { xcodeLight, xcodeDark, xcodeLightInit, xcodeDarkInit } from '@uiw/codemirror-theme-xcode';

// Dark Themes
import { abcdef, abcdefInit } from '@uiw/codemirror-theme-abcdef';
import { abyss, abyssInit } from '@uiw/codemirror-theme-abyss';
import { androidstudio, androidstudioInit } from '@uiw/codemirror-theme-androidstudio';
import { andromeda, andromedaInit } from '@uiw/codemirror-theme-andromeda';
import { atomone, atomoneInit } from '@uiw/codemirror-theme-atomone';
import { aura, auraInit } from "@uiw/codemirror-theme-aura";
import { bespin, bespinInit } from '@uiw/codemirror-theme-bespin';
import { copilot, copilotInit } from '@uiw/codemirror-theme-copilot';
import { dracula, draculaInit } from "@uiw/codemirror-theme-dracula";
import { darcula, darculaInit } from '@uiw/codemirror-theme-darcula';
import { monokai, monokaiInit } from "@uiw/codemirror-theme-monokai";
import { monokaiDimmed, monokaiDimmedInit } from '@uiw/codemirror-theme-monokai-dimmed';
import { kimbie, kimbieInit } from '@uiw/codemirror-theme-kimbie';
import { nord, nordInit } from "@uiw/codemirror-theme-nord";
import { okaidia, okaidiaInit } from '@uiw/codemirror-theme-okaidia';
import { red, redInit } from '@uiw/codemirror-theme-red';
import { sublime, sublimeInit } from '@uiw/codemirror-theme-sublime';
import { tokyoNight, tokyoNightInit } from "@uiw/codemirror-theme-tokyo-night";
import { tokyoNightStorm, tokyoNightStormInit } from '@uiw/codemirror-theme-tokyo-night-storm';
import { tomorrowNightBlue, tomorrowNightBlueInit } from '@uiw/codemirror-theme-tomorrow-night-blue';
import {vscodeDark, vscodeDarkInit } from "@uiw/codemirror-theme-vscode";

// Light Themes
import { bbedit, bbeditInit } from '@uiw/codemirror-theme-bbedit';
import { eclipse, eclipseInit } from '@uiw/codemirror-theme-eclipse';
import { noctisLilac, noctisLilacInit } from '@uiw/codemirror-theme-noctis-lilac';
import { quietlight, quietlightInit } from '@uiw/codemirror-theme-quietlight';
import { tokyoNightDay, tokyoNightDayInit } from '@uiw/codemirror-theme-tokyo-night-day';
import { vscodeLight, vscodeLightInit } from '@uiw/codemirror-theme-vscode';
import { materialLight, materialLightInit } from "@uiw/codemirror-theme-material";

import { useColorMode, useColorModeValue } from '../../ui/color-mode';
import FileContext from '../../../context/file/FileContext';

const CodeEditor = ({ language = "typescript" }) => {
  const { selectedFile } = useContext(FileContext);

  const [code, setCode] = useState('');
  const [theme, setTheme] = useState(vscodeDark);
  const { colorMode } = useColorMode();

  useEffect(() => {
    setTheme(colorMode === "dark" ? tokyoNight : githubLight);
  }, [colorMode]);

  useEffect(() => {
    if (selectedFile && selectedFile.code) {
      setCode(selectedFile.code);
      console.log(selectedFile);
    }
  }, [selectedFile]);

  const onChange = (value: string) => {
    setCode(value);
  };

  const getLanguage = () => {
    switch (language) {
      case "rust":
        return rust();
      case "typescript":
        return javascript({ typescript: true });
      default:
        return javascript({ typescript: true });
    }
  };

  const menuBg = useColorModeValue("var(--settings-menu-bg-light)", "var(--settings-menu-bg-dark)");
  const menuBorder = useColorModeValue("var(--settings-menu-border-light)", "var(--settings-menu-border-dark)");
  const menuColor = useColorModeValue("var(--settings-menu-color-light)", "var(--settings-menu-color-dark)");

  const menuItemStyle = {
    ...settingsMenuItem,
    background: menuBg,
    border: `1px solid ${menuBorder}`,
    color: menuColor,
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex" style={codeEditorHeader as React.CSSProperties}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer p-[5px]"
            >
              <IoSettingsSharp className="text-gray-500" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            className="z-50"
            style={{
              background: menuBg,
              border: `1px solid ${menuBorder}`,
              color: menuColor
            }}
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger 
                className="cursor-pointer"
                style={{
                  ...settingsMenuThemeTrigger as React.CSSProperties,
                  background: menuBg,
                  border: `1px solid ${menuBorder}`,
                  color: menuColor
                }}
              >
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent 
                  className="z-50"
                  style={{
                    background: menuBg,
                    border: `1px solid ${menuBorder}`,
                    color: menuColor
                  }}
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="cursor-pointer"
                      style={{
                        ...settingsMenuThemeTrigger as React.CSSProperties,
                        background: menuBg,
                        border: `1px solid ${menuBorder}`,
                        color: menuColor
                      }}
                    >
                      Dark
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent 
                        className="max-h-[500px] overflow-y-auto z-50"
                        style={{
                          background: menuBg,
                          border: `1px solid ${menuBorder}`,
                          color: menuColor
                        }}
                      >
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(abcdef)}>Abcdef</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(abyss)}>Abyss</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(androidstudio)}>Android Studio</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(andromeda)}>Andromeda</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(atomone)}>Atom One</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(aura)}>Aura</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(bespin)}>Bespin</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(copilot)}>Copilot</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(darcula)}>Darcula</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(dracula)}>Dracula</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(gruvboxDark)}>Gruvbox Dark</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(kimbie)}>Kimbie</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(monokai)}>Monokai</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(monokaiDimmed)}>Monokai Dimmed</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(nord)}>Nord</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(okaidia)}>Okaidia</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(red)}>Red</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(solarizedDark)}>Solarized Dark</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(sublime)}>Sublime</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(tokyoNight)}>Tokyo Night</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(tokyoNightStorm)}>Tokyo Night Storm</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(tomorrowNightBlue)}>Tomorrow Night Blue</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(vscodeDark)}>VSCode Dark</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger
                      className="cursor-pointer"
                      style={{
                        ...settingsMenuThemeTrigger as React.CSSProperties,
                        background: menuBg,
                        border: `1px solid ${menuBorder}`,
                        color: menuColor
                      }}
                    >
                      Light
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent
                        className="z-50"
                        style={{
                          background: menuBg,
                          border: `1px solid ${menuBorder}`,
                          color: menuColor
                        }}
                      >
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(basicLight)}>Basic Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(bbedit)}>BBEdit</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(consoleLight)}>Console Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(duotoneLight)}>Duotone Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(eclipse)}>Eclipse</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(githubLight)}>GitHub Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(noctisLilac)}>Noctis Lilac</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(quietlight)}>Quiet Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(solarizedLight)}>Solarized Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(tokyoNightDay)}>Tokyo Night Day</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(vscodeLight)}>VSCode Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(whiteLight)}>White Light</DropdownMenuItem>
                        <DropdownMenuItem style={menuItemStyle as React.CSSProperties} onClick={() => setTheme(xcodeLight)}>Xcode Light</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex justify-self-center h-[93%] w-full z-0">
        <CodeMirror
          value={code}
          height="100%"
          width="63.6vw"
          theme={theme}
          extensions={[getLanguage()]}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
