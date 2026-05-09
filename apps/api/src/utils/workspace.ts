import fs from "node:fs/promises";
import path from "node:path";
const ignored = new Set(["node_modules", ".git", "dist", "build", ".next", ".turbo", "coverage", ".env", ".DS_Store", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"]);
export function resolveWorkspace(configured?: string) {
  const selected = configured || process.env.WORKSPACE_DIR || "../../sample-workspace";
  return path.resolve(process.cwd(), selected);
}
export function safeJoin(root: string, relativePath: string) {
  const target = path.resolve(root, relativePath || ".");
  if (!target.startsWith(root)) throw new Error("Blocked unsafe path outside workspace.");
  return target;
}
export async function listFiles(root: string, dir = ".", depth = 5): Promise<string[]> {
  const base = safeJoin(root, dir); const results: string[] = [];
  async function walk(current: string, level: number) {
    if (level > depth) return;
    let entries; try { entries = await fs.readdir(current, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const full = path.join(current, entry.name); const rel = path.relative(root, full);
      if (entry.isDirectory()) { results.push(rel + "/"); await walk(full, level + 1); }
      else results.push(rel);
    }
  }
  await walk(base, 0); return results.sort();
}
export async function readWorkspaceFile(root: string, relativePath: string) { return fs.readFile(safeJoin(root, relativePath), "utf8"); }
export async function writeWorkspaceFile(root: string, relativePath: string, content: string) {
  const target = safeJoin(root, relativePath); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, content, "utf8");
  return { path: relativePath, bytes: Buffer.byteLength(content) };
}
export async function deleteWorkspaceFile(root: string, relativePath: string) { await fs.rm(safeJoin(root, relativePath), { force: true }); return { deleted: relativePath }; }
export async function analyzeRepo(root: string) {
  const files = await listFiles(root); const has = (name: string) => files.includes(name);
  const packageJson = has("package.json") ? JSON.parse(await readWorkspaceFile(root, "package.json")) : null;
  return { root, fileCount: files.length, importantFiles: files.filter(f => ["package.json","vite.config.ts","next.config.js","tsconfig.json","src/"].some(x => f.startsWith(x) || f === x)).slice(0,80), packageManager: has("pnpm-lock.yaml") ? "pnpm" : has("yarn.lock") ? "yarn" : "npm", scripts: packageJson?.scripts || {}, dependencies: packageJson?.dependencies || {}, devDependencies: packageJson?.devDependencies || {} };
}
