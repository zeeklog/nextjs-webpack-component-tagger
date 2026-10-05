# @zeeklog/nextjs-webpack-component-tagger

A webpack loader for Next.js that automatically adds data-dyad-id and data-dyad-name attributes to your React components. This public mirror is derived from the Apache-2.0 package originally published by Dyad.

## Installation

```bash
npm install @zeeklog/nextjs-webpack-component-tagger
# or
yarn add @zeeklog/nextjs-webpack-component-tagger
# or
pnpm add @zeeklog/nextjs-webpack-component-tagger
```

## Usage

Add the loader to your next.config.js file:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: /node_modules/,
      enforce: "pre",
      use: "@zeeklog/nextjs-webpack-component-tagger",
    });
    return config;
  },
};

module.exports = nextConfig;
```

The loader automatically adds data-dyad-id and data-dyad-name to React components. The data-dyad-id value identifies each component instance as path/to/file.tsx:line:column.

## Source

This repository mirrors the published Dyad build. It retains the original Apache-2.0 license and attribution.
