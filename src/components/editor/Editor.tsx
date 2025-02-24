import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { PlayIcon, RotateCcwIcon, SparklesIcon, TrashIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import Preview from "./preview";

import localForage from "localforage";
import { Badge } from "../ui/badge";


const fileCache = localForage.createInstance({
    name: "file-cache",
});



const exampleCode = `const _ = require('lodash')
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

const initialCode = `const _ = require('lodash')
// A JavaScript playground with CDN-loaded NPM support  
// Uses esbuild-wasm, so ensure your browser supports WASM 
`

function Editor() {
    const monacoRef = useRef<Monaco | null>(null);

    const [code, setCode] = React.useState<string>(initialCode);
    const [runner, setRunner] = React.useState<any>(initialCode);

    const [replStatus, setReplStatus] = React.useState(true);
    const [autoStatus, setAutoStatus] = React.useState(true);

    const [attributes, setAttributes] = React.useState({});

    useEffect(() => {
        const handler = setTimeout(() => {
            if (autoStatus) {
                setRunner(code);
            }
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [code, autoStatus]);

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
        setCode(initialCode);
        setRunner(initialCode);
    }

    const handleTrash = async () => {
        await fileCache.clear()
    }

    const handleExample = () => {
        setCode(exampleCode);
        setRunner(exampleCode);
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
                    <div className="flex items-center justify-between border-b px-3 py-2">
                        <div className="flex  gap-2 items-center  ">

                            {!autoStatus && < Button className="w-8 h-8 " title="Execute code" variant="secondary" onClick={handleRun}>
                                <PlayIcon />
                            </Button>}
                            <Button className="w-8 h-8 " title="Clear document" variant="secondary" onClick={handleReset}>
                                <RotateCcwIcon />
                            </Button>
                            <Button className="w-8 h-8 " title="Clear cache" variant="secondary" onClick={handleTrash}>
                                <TrashIcon />
                            </Button>
                            <Button className="w-8 h-8 " title="Example" variant="secondary" onClick={handleExample}>
                                <SparklesIcon />
                            </Button>
                        </div>
                        <div>
                            <Button className="py-0" title="No more console.log just write" variant="ghost" onClick={() => setReplStatus(!replStatus)}>
                                REPL <Badge variant={replStatus ? "outline" : "destructive"}>{replStatus ? "ON" : "OFF"}</Badge>
                            </Button>

                            <Button className="py-0" title="Auto execute or on run" variant="ghost" onClick={() => setAutoStatus(!autoStatus)}>
                                AUTO <Badge variant={autoStatus ? "outline" : "destructive"}>{autoStatus ? "ON" : "OFF"}</Badge>
                            </Button>

                        </div>
                    </div>
                    <Preview
                        input={runner}
                        attributes={attributes}
                        updateAttributes={setAttributes}
                        repl={replStatus}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div >
    );
}

export default Editor;
