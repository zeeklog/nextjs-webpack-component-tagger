// src/index.ts
import { parse } from "@babel/parser";
import MagicString from "magic-string";
import path from "path";
import { walk } from "estree-walker";
var VALID_EXTENSIONS = /* @__PURE__ */ new Set([".jsx", ".tsx"]);
function dyadTaggerLoader(code) {
  const callback = this.async();
  const transform = async () => {
    try {
      if (!VALID_EXTENSIONS.has(path.extname(this.resourcePath)) || this.resourcePath.includes("node_modules")) {
        return null;
      }
      const ast = parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
        sourceFilename: this.resourcePath
      });
      const ms = new MagicString(code);
      const fileRelative = path.relative(this.rootContext, this.resourcePath);
      let transformCount = 0;
      walk(ast, {
        enter: (node) => {
          try {
            if (node.type !== "JSXOpeningElement") return;
            if (node.name?.type !== "JSXIdentifier") return;
            const tagName = node.name.name;
            if (!tagName) return;
            const alreadyTagged = node.attributes?.some(
              (attr) => attr.type === "JSXAttribute" && attr.name?.name === "data-dyad-id"
            );
            if (alreadyTagged) return;
            const loc = node.loc?.start;
            if (!loc) return;
            const dyadId = `${fileRelative}:${loc.line}:${loc.column}`;
            if (node.name.end != null) {
              ms.appendLeft(
                node.name.end,
                ` data-dyad-id="${dyadId}" data-dyad-name="${tagName}"`
              );
              transformCount++;
            }
          } catch (error) {
            console.warn(
              `[dyad-tagger] Warning: Failed to process JSX node in ${this.resourcePath}:`,
              error
            );
          }
        }
      });
      if (transformCount === 0) {
        return null;
      }
      const transformedCode = ms.toString();
      return {
        code: transformedCode,
        map: ms.generateMap({ hires: true })
      };
    } catch (error) {
      console.warn(
        `[dyad-tagger] Warning: Failed to transform ${this.resourcePath}:`,
        error
      );
      return null;
    }
  };
  transform().then((result) => {
    if (result) {
      callback(null, result.code, result.map);
    } else {
      callback(null, code);
    }
  }).catch((err) => {
    console.error(`[dyad-tagger] ERROR in ${this.resourcePath}:`, err);
    callback(null, code);
  });
}
export {
  dyadTaggerLoader as default
};
