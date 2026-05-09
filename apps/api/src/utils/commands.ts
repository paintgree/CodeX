import { spawn } from "node:child_process";
const allowedStarts = ["npm install","npm test","npm run test","npm run build","npm run lint","npm run typecheck","npm run check","pnpm install","pnpm test","pnpm run test","pnpm run build","pnpm run lint","pnpm run typecheck","yarn install","yarn test","yarn build","yarn lint","yarn typecheck","npx tsc","npx eslint","git diff","git status"];
export function isAllowedCommand(command: string) { const clean = command.trim(); return allowedStarts.some(prefix => clean === prefix || clean.startsWith(prefix + " ")); }
export async function runCommand(command: string, cwd: string, timeoutMs = 120000) {
  if (!isAllowedCommand(command)) return { ok:false, command, code:-1, output:`Command blocked for safety: ${command}\nAllowed examples: npm test, npm run build, npm run lint, npx tsc, git diff` };
  return await new Promise<{ ok:boolean; command:string; code:number|null; output:string }>((resolve) => {
    const child = spawn(command, { cwd, shell:true, env:{ ...process.env, CI:"true" } }); let output = "";
    const timer = setTimeout(() => { child.kill("SIGTERM"); resolve({ ok:false, command, code:-1, output: output + "\nCommand timed out." }); }, timeoutMs);
    child.stdout.on("data", d => output += d.toString()); child.stderr.on("data", d => output += d.toString());
    child.on("close", code => { clearTimeout(timer); resolve({ ok:code===0, command, code, output:output.slice(-16000) }); });
  });
}
