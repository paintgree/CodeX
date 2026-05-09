import { Send, Bot } from "lucide-react";
import type { ChatMessage } from "@agentforge/shared";
import { useState } from "react";
type Props = { messages: ChatMessage[]; busy: boolean; toolLog: string[]; onSend: (message: string) => void; };
export function ChatPanel({ messages, busy, toolLog, onSend }: Props) {
  const [text, setText] = useState("");
  function submit(value = text) { const trimmed = value.trim(); if (!trimmed || busy) return; setText(""); onSend(trimmed); }
  const starter = "Analyze this repo, find errors, fix them, and run the best available tests/build checks.";
  return <section className="panel chat"><div className="panel-header"><div className="brand-small"><Bot size={18}/> Pro Coding Agent</div></div><div className="messages">{messages.length===0 && <div className="welcome"><h2>Ask. I inspect. I fix. I test.</h2><p>This agent can read your repo, edit files, run checks, and improve the code.</p><button onClick={()=>submit(starter)}>Analyze and fix my repo</button></div>}{messages.map((m,i)=><div key={i} className={`message ${m.role}`}><span>{m.role === "user" ? "You" : "AgentForge Pro"}</span><p>{m.content}</p></div>)}{busy && <div className="message assistant"><span>AgentForge Pro</span><p>Working through repo tools...</p></div>}{toolLog.length>0 && <details className="tool-log"><summary>Internal actions</summary>{toolLog.map((t,i)=><code key={i}>{t}</code>)}</details>}</div><div className="composer"><textarea value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}}} placeholder="Example: Run npm test, fix the errors, and run npm run build after."/><button onClick={()=>submit()} disabled={busy || !text.trim()}><Send size={18}/></button></div></section>;
}
