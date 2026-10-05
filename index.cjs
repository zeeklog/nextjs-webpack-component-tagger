"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => dyadTaggerLoader
});
module.exports = __toCommonJS(index_exports);
var import_parser = require("@babel/parser");
var import_magic_string = __toESM(require("magic-string"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_estree_walker = require("estree-walker");
var VALID_EXTENSIONS = /* @__PURE__ */ new Set([".jsx", ".tsx"]);
function dyadTaggerLoader(code) {
  const callback = this.async();
  const transform = async () => {
    try {
      if (!VALID_EXTENSIONS.has(import_node_path.default.extname(this.resourcePath)) || this.resourcePath.includes("node_modules")) {
        return null;
      }
      const ast = (0, import_parser.parse)(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
        sourceFilename: this.resourcePath
      });
      const ms = new import_magic_string.default(code);
      const fileRelative = import_node_path.default.relative(this.rootContext, this.resourcePath);
      let transformCount = 0;
      (0, import_estree_walker.walk)(ast, {
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
