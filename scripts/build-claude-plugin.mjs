import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const out = resolve(root, "dist/claude-plugin");

// 1. Clean
rmSync(out, { recursive: true, force: true });

// 2. Create output structure
mkdirSync(resolve(out, ".claude-plugin"), { recursive: true });

// 3. Build plugin.json — inject version from package.json
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf-8"));
const plugin = JSON.parse(
  readFileSync(resolve(__dirname, "template/plugin.json"), "utf-8")
);
plugin.version = pkg.version;
writeFileSync(
  resolve(out, ".claude-plugin/plugin.json"),
  JSON.stringify(plugin, null, 2) + "\n"
);

// 4. Copy skills and agents into plugin root
cpSync(resolve(root, "skills"), resolve(out, "skills"), { recursive: true });
cpSync(resolve(root, "agents"), resolve(out, "agents"), { recursive: true });

// 5. Create zip
const zipFile = resolve(root, `dist/novadb-plugin-${pkg.version}.zip`);
execSync(`zip -r "${zipFile}" .`, { cwd: out, stdio: "inherit" });

// 6. Clean up intermediate directory
rmSync(out, { recursive: true, force: true });

console.log(`Plugin packed: dist/novadb-plugin-${pkg.version}.zip`);
