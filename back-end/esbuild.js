import esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["src/serve.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  outdir: "dist",
  minify: true,
  minifySyntax: true,
  minifyIdentifiers: true,
  minifyWhitespace: true,

  sourcemap: false,
  keepNames: false,
  treeShaking: true,
  packages: "external",
  splitting: true,
  metafile: true,

  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);"
  },

  entryNames: "[name]",
  logLevel: "info",
  tsconfig: "./tsconfig.json"
})

console.log("✅ Build complete")
