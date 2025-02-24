import * as esbuild from "esbuild-wasm";
import * as acorn from "acorn";

/**
 * Strictly detects whether a line is a "pure expression" for automatic logging.
 */
function isExpression(code: string) {
  try {
    const node = acorn.parse(code, { ecmaVersion: "latest" }).body[0];

    if (!node) return false;

    // ✅ Allow only top-level expressions
    if (node.type == "ExpressionStatement") {
      const expr = node.expression;
      if (
        expr.type === "CallExpression" &&
        expr.callee.type === "MemberExpression"
      ) {
        const { object, property } = expr.callee;
        if (object.type === "Identifier" && object.name === "console")
          return false;
      }
      return true;
    }

    return false;
  } catch (e) {
    return false; // Invalid code or syntax errors
  }
}

/**
 * Transforms REPL-like input to automatically log expressions.
 */
function transformCode(code: string) {
  const lines = code.split("\n").filter((line) => line.trim() !== "");
  return lines
    .map((line) => (isExpression(line) ? `console.log(${line});` : line))
    .join("\n");
}

export const replPlugin = (input: string) => {
  return {
    name: "repl-transform",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^input\.ts$)/ }, async (args) => {
        // Process code input (comes from stdin in esbuild-wasm)
        const source = args.pluginData?.code || "";

        // Transform REPL-like input
        const transformedCode = transformCode(input);

        console.log("Transformed Code:", transformedCode);

        return { contents: transformedCode, loader: "js" };
      });
    },
  };
};
