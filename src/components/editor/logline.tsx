import { JsonInspector } from "@rexxars/react-json-inspector";
import "@rexxars/react-json-inspector/json-inspector.css";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CopyIcon,
  EyeIcon,
  InfoIcon,
  XOctagon
} from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";

import _ from "lodash";
import { Input } from "../ui/input";


interface LogLineProps {
  type: string;
  args: string[];
}

const SearchInput = ({ query, onChange }: { query: string, onChange: (val: string) => void }) => {
  return <Input className="my-4" value={query} onChange={(event) => onChange?.(event.target.value)} placeholder="Search" />
}

const isSmallObject = (obj = {}, keyLimit = 10, depthLimit = 2) => {
  const totalKeys = _.keys(obj).length;
  const depth = getDepth(obj);

  return totalKeys <= keyLimit && depth <= depthLimit;
};

const getDepth = (obj: {}): number => {
  if (!_.isObject(obj)) return 0;
  return 1 + Math.max(0, ..._.values(obj).map(getDepth));
};


const LogLine = ({ type, args }: LogLineProps) => {
  let icon = null
  let isJSON = false
  let jsonData = null

  switch (type) {
    case "ERR":
      icon = <XOctagon className="w-3.5 h-3.5 text-red-500" />
      break
    case "INFO":
      icon = <InfoIcon className="w-3.5 h-3.5 text-blue-500" />
      break
    case "WARN":
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      break
    case "LOG":
      try {
        jsonData = JSON.parse(args.join(" "))
        isJSON = true
      } catch (error) {
        isJSON = false
        jsonData = null
      }
      break;
    case "RESULT":
    case "HTML":
      icon = <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
      break
  }

  let output: any = args.join(" ")
  if (type === "HTML") {
    output = <div dangerouslySetInnerHTML={{ __html: output }} />
  }

  if (type === "TIME") {
    return (
      <div className="text-gray-500 text-xs px-3 py-2 flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        <span>Finished running in {output}ms</span>
      </div>
    )
  }

  const handleCopy = () => isJSON && jsonData ? navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2)) : navigator.clipboard.writeText(output)

  return (
    <div className="flex border-t px-2 py-2 gap-2">
      <div className="flex items-center border-r">
        <Button className="py-0 opacity-30 w-8 h-8" variant='secondary' onClick={handleCopy}>
          <CopyIcon />
        </Button>
        <Dialog>
          <DialogTrigger className={'opacity-30'} >
            <div className="w-8 h-8 flex items-center justify-center bg-secondary rounded mx-2">
              <EyeIcon size={18} />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-5xl" >
            <DialogTitle>

            </DialogTitle>
            <div className="container w-full">
              {(isJSON && jsonData) ? <JsonInspector data={jsonData} search={SearchInput} isExpanded={(keypath, value) => isSmallObject(value as Object, 100, 2)} />
                : <pre className="max-h-[500px] overflow-auto break-all whitespace-pre-wrap p-4rounded-lg">
                  {output}
                </pre>

              }

            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="font-mono text-sm flex items-center gap-2 container max-h-40">
        <pre>
          {output}
        </pre>
      </div>
    </div>

  )
}

export default LogLine
