import { cpSync, mkdirSync, rmSync, unlinkSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { packExtension } from "@anthropic-ai/mcpb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = resolve(root, "dist/claude-extension");

// 1. Clean
rmSync(out, { recursive: true, force: true });

// 2. Create output structure
mkdirSync(resolve(out, "server"), { recursive: true });

// 3. Build manifest — inject version from package.json
const tmpl = resolve(__dirname, "template");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));
const manifest = JSON.parse(
  readFileSync(resolve(tmpl, "manifest.json"), "utf-8")
);
manifest.version = pkg.version;
writeFileSync(resolve(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// 3b. Copy icon to extension root
cpSync(resolve(tmpl, "icon.png"), resolve(out, "icon.png"));

// 4. Copy compiled server files
const distSrc = resolve(root, "dist/src");
if (!existsSync(distSrc)) {
  console.error("Error: dist/src/ not found. Run 'npm run build' first.");
  process.exit(1);
}
cpSync(distSrc, resolve(out, "server"), { recursive: true });

// 5. Install production dependencies
cpSync(resolve(root, "package.json"), resolve(out, "package.json"));
console.log("Installing production dependencies...");
execSync("npm install --omit=dev", { cwd: out, stdio: "inherit" });

// 6. Clean up temporary files
unlinkSync(resolve(out, "package.json"));
const lockFile = resolve(out, "package-lock.json");
if (existsSync(lockFile)) unlinkSync(lockFile);

// 7. Pack into .mcpb bundle
const mcpbFile = resolve(root, `dist/novadb-${pkg.version}.mcpb`);
console.log("Packing .mcpb bundle...");
const success = await packExtension({
  extensionPath: out,
  outputPath: mcpbFile,
});
if (!success) {
  console.error("Failed to pack .mcpb bundle");
  process.exit(1);
}

// 8. Clean up intermediate directory
rmSync(out, { recursive: true, force: true });

console.log(`Extension packed: dist/novadb-${pkg.version}.mcpb`);
