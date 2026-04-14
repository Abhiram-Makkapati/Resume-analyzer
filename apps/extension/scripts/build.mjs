import { build, context } from "esbuild";
import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const dist = path.join(root, "dist");
const watch = process.argv.includes("--watch");

mkdirSync(dist, { recursive: true });
cpSync(path.join(root, "public"), dist, { recursive: true });

const sharedDefine = {
  "process.env.EXT_FIREBASE_API_KEY": JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ""),
  "process.env.EXT_FIREBASE_AUTH_DOMAIN": JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? ""),
  "process.env.EXT_FIREBASE_PROJECT_ID": JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ""),
  "process.env.EXT_FIREBASE_STORAGE_BUCKET": JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? ""),
  "process.env.EXT_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? ""),
  "process.env.EXT_FIREBASE_APP_ID": JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""),
  "process.env.EXT_FUNCTIONS_REGION": JSON.stringify(process.env.NEXT_PUBLIC_FUNCTIONS_REGION ?? "us-central1"),
  "process.env.EXT_WEB_APP_URL": JSON.stringify(process.env.NEXT_PUBLIC_EXTENSION_IMPORT_URL ?? "")
};

if (watch) {
  const watcher = await context({
    entryPoints: {
      popup: path.join(root, "src/popup.ts"),
      background: path.join(root, "src/background.ts"),
      content: path.join(root, "src/content.ts")
    },
    outdir: dist,
    bundle: true,
    format: "esm",
    target: "chrome120",
    sourcemap: true,
    define: sharedDefine,
    logLevel: "info"
  });
  await watcher.watch();
} else {
  await build({
    entryPoints: {
      popup: path.join(root, "src/popup.ts"),
      background: path.join(root, "src/background.ts"),
      content: path.join(root, "src/content.ts")
    },
    outdir: dist,
    bundle: true,
    format: "esm",
    target: "chrome120",
    sourcemap: true,
    define: sharedDefine,
    logLevel: "info"
  });
}
