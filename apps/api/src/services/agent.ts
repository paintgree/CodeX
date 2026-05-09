import OpenAI from "openai";
import { z } from "zod";
import { analyzeRepo, deleteWorkspaceFile, listFiles, readWorkspaceFile, writeWorkspaceFile } from "../utils/workspace.js";
import { runCommand } from "../utils/commands.js";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ChatMessage = z.object({ role: z.enum(["user", "assistant"]), content: z.string() });
export const ChatRequest = z.object({ messages: z.array(ChatMessage), workspaceRoot: z.string() });
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
{ type:"function", function:{ name:"analyze_repo", description:"Analyze repo structure, scripts, dependencies, and important files.", parameters:{ type:"object", properties:{} } } },
{ type:"function", function:{ name:"list_files", description:"List files in the current workspace.", parameters:{ type:"object", properties:{ dir:{type:"string"}, depth:{type:"number"} } } } },
{ type:"function", function:{ name:"read_file", description:"Read a file from the workspace.", parameters:{ type:"object", required:["path"], properties:{ path:{type:"string"} } } } },
{ type:"function", function:{ name:"write_file", description:"Create or replace a file in the workspace.", parameters:{ type:"object", required:["path","content"], properties:{ path:{type:"string"}, content:{type:"string"} } } } },
{ type:"function", function:{ name:"delete_file", description:"Delete a file from the workspace. Use carefully.", parameters:{ type:"object", required:["path"], properties:{ path:{type:"string"} } } } },
{ type:"function", function:{ name:"run_command", description:"Run a safe dev command: npm test, npm run build, npm run lint, npx tsc, git diff.", parameters:{ type:"object", required:["command"], properties:{ command:{type:"string"} } } } }
];
async function runTool(root: string, name: string, rawArgs: string) {
  const args = rawArgs ? JSON.parse(rawArgs) : {};
  if (name === "analyze_repo") return JSON.stringify(await analyzeRepo(root), null, 2);
  if (name === "list_files") return JSON.stringify(await listFiles(root, args.dir || ".", args.depth || 5), null, 2);
  if (name === "read_file") return await readWorkspaceFile(root, args.path);
  if (name === "write_file") return JSON.stringify(await writeWorkspaceFile(root, args.path, args.content), null, 2);
  if (name === "delete_file") return JSON.stringify(await deleteWorkspaceFile(root, args.path), null, 2);
  if (name === "run_command") return JSON.stringify(await runCommand(args.command, root), null, 2);
  throw new Error(`Unknown tool: ${name}`);
}
export async function runAgent(input: z.infer<typeof ChatRequest>) {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const system = `You are AgentForge Pro Coder, a senior full-stack engineer and AI coding agent. Inspect files, run tests/build/lint/typecheck, diagnose actual errors, edit files, re-run checks, and summarize changed files. Use tools for repo facts. Do not guess file contents. Never edit outside the workspace. Prefer precise fixes. If tests are unavailable, run best available build/typecheck/lint. Keep explanations beginner-friendly.
Final response format after any fix, code change, test, build, or repo analysis:
Start with one short status line, for example:
"Fixed it." or "I found the issue, but one check still needs attention."

Then use these exact sections:

What was wrong:
- Explain the actual error or broken behavior in simple words.
- Mention why it happened, not only what file failed.

I changed:
- List every changed file.
- For each file, explain what changed and why.
- Use this format: path/to/file.ext — short explanation.

Verified:
- List every command you ran, such as npm test, npm run build, npm run lint, npx tsc, or git diff.
- State what passed.
- If a check was unavailable or failed, say that clearly.

Next step:
- Tell the user exactly what to do next, such as refresh the page, rerun the app, or test a specific flow.

If no code was changed, replace "I changed:" with "I checked:".
Never end with only a vague summary. Always make the user understand the bug, the fix, and the verification.
`;
  let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role:"system", content:system }, ...input.messages.map(m => ({ role:m.role, content:m.content }))];
  const toolLog: string[] = [];
  for (let step = 0; step < 10; step++) {
    const response = await client.chat.completions.create({ model, messages, tools, tool_choice:"auto" });
    const msg = response.choices[0]?.message; if (!msg) throw new Error("No response from AI model."); messages.push(msg);
    if (!msg.tool_calls?.length) return { reply: msg.content || "Done.", toolLog };
    for (const call of msg.tool_calls) { const output = await runTool(input.workspaceRoot, call.function.name, call.function.arguments || "{}"); toolLog.push(`${call.function.name}(${call.function.arguments || "{}"})`); messages.push({ role:"tool", tool_call_id:call.id, content:output }); }
  }
  return { reply:"I reached the internal step limit. Ask me to continue and I will keep working from here.", toolLog };
}
