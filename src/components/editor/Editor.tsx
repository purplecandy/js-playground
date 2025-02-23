import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { PlayIcon, RotateCcwIcon, TrashIcon } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import Preview from "./preview";

import localForage from "localforage";


const fileCache = localForage.createInstance({
    name: "file-cache",
});



const initialCode = `const _ = require('lodash')
const { format } = require('date-fns/format');
const { addDays} = require('date-fns/addDays');

// A JavaScript playground with CDN-loaded NPM support  
// Uses esbuild-wasm, so ensure your browser supports WASM 

// Get the current date
const today = new Date();
console.log("Today's date:", format(today, 'yyyy-MM-dd'));

// Add 7 days to the current date
const nextWeek = addDays(today, 7);
console.log("Next week's date:", format(nextWeek, 'yyyy-MM-dd'));

const numbers = [1, 2, 3, 4, 5];


const doubledNumbers = _.map(numbers, (number) => number * 2);
console.log(doubledNumbers);`

const resetCode = `const _ = require('lodash')

`

function Editor() {
    const monacoRef = useRef<Monaco | null>(null);

    const [code, setCode] = React.useState<string>(initialCode);
    const [runner, setRunner] = React.useState<any>(initialCode);

    const [attributes, setAttributes] = React.useState({});

    function handleEditorWillMount(monaco: {
        languages: {
            typescript: {
                javascriptDefaults: { setEagerModelSync: (arg0: boolean) => void };
            };
        };
    }) {
        // here is the monaco instance
        // do something before editor is mounted
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    }

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        // here is another way to get monaco instance
        // you can also store it in `useRef` for further usage
        monacoRef.current = monaco;
    }

    const handleRun = () => {
        setRunner(code)
    }

    const handleReset = () => {
        setCode(resetCode);
        setRunner(resetCode);
    }

    const handleTrash = async () => {
        await fileCache.clear()
    }

    return (
        <div className="">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <MonacoEditor
                        className=""
                        height="100vh"
                        theme="vs-dark"
                        options={{
                            fontFamily: `'Segoe UI Variable',Menlo,Consolas,'Courier New', monospace`,
                            fontSize: 18,
                            minimap: {
                                enabled: false,
                            },
                            lineNumbers: "off",
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on'

                        }}
                        value={code}
                        defaultLanguage="javascript"
                        defaultValue={code}
                        beforeMount={handleEditorWillMount}
                        onMount={handleEditorDidMount}
                        onChange={(value) => setCode(value || "")}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel>
                    <div className="flex  gap-2 items-center px-3 py-2 border-b">
                        <Button className="w-8 h-8 " title="Execute code" variant="secondary" onClick={handleRun}>
                            <PlayIcon />
                        </Button>
                        <Button className="w-8 h-8 " title="Clear document" variant="secondary" onClick={handleReset}>
                            <RotateCcwIcon />
                        </Button>
                        <Button className="w-8 h-8 " title="Clear cache" variant="secondary" onClick={handleTrash}>
                            <TrashIcon />
                        </Button>
                    </div>
                    <Preview
                        input={runner}
                        attributes={attributes}
                        updateAttributes={setAttributes}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

export default Editor;
