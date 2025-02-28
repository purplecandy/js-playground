import * as esbuild from "esbuild-wasm";

import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";
import { replPlugin } from "./plugins/repl-plugin";

interface BundledResult {
  output: string;
  error: string;
}

let loaded = false;
let isLoading = false;

export const loadEsbuild = async () => {
  if (loaded) {
    return;
  }

  if (isLoading) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isLoading) {
          clearInterval(interval);
          resolve("");
        }
      }, 100);
    });
  }

  isLoading = true;

  try {
    console.log("Initializing esbuild");
    await esbuild.initialize({
      worker: true,
      // 0.25.0 at the time of writing
      wasmURL: "https://unpkg.com/esbuild-wasm@0.25.0/esbuild.wasm",
    });
    loaded = true;
  } catch (error) {
    console.log(error);
  }
  isLoading = false;
};

const esBundle = async (
  input: string,
  repl: boolean = true
): Promise<BundledResult> => {
  await loadEsbuild();
  try {
    const result = await esbuild.build({
      entryPoints: ["input.ts"],
      bundle: true,
      minify: false,
      format: "esm",
      platform: "node",
      write: false,
      plugins: [
        ...(repl ? [replPlugin(input)] : []),
        unpkgPathPlugin(),
        fetchPlugin(input),
      ],
      define: {
        global: "window",
      },
    });
    return {
      output: result.outputFiles[0].text,
      error: "",
    };
  } catch (error) {
    return {
      output: "",
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

export default esBundle;
