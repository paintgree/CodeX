import { useEffect, useState } from "react";
import type { ChatMessage } from "@agentforge/shared";
import { ChatPanel } from "./components/ChatPanel";
import { FileExplorer } from "./components/FileExplorer";
import { WorkspacePicker } from "./components/WorkspacePicker";
import { getFile, getFiles, getWorkspace, sendChat, setWorkspace } from "./lib/api";
import "./styles.css";
export default function App() {
  const [workspace,setWorkspaceState]=useState(""); const [analysis,setAnalysis]=useState<any>(null); const [files,setFiles]=useState<string[]>([]); const [selected,setSelected]=useState<string>(); const [fileContent,setFileContent]=useState(""); const [messages,setMessages]=useState<ChatMessage[]>([]); const [toolLog,setToolLog]=useState<string[]>([]); const [busy,setBusy]=useState(false);
  async function refreshWorkspace(){ const data=await getWorkspace(); setWorkspaceState(data.workspaceRoot); setAnalysis(data.analysis); setFiles(await getFiles()); }
  async function updateWorkspace(path:string){ const data=await setWorkspace(path); setWorkspaceState(data.workspaceRoot); setAnalysis(data.analysis); setFiles(await getFiles()); setSelected(undefined); setFileContent(""); }
  async function refreshFiles(){ setFiles(await getFiles()); }
  async function selectFile(path:string){ setSelected(path); setFileContent(await getFile(path)); }
  async function handleSend(content:string){ const next:ChatMessage[]=[...messages,{role:"user",content}]; setMessages(next); setBusy(true); setToolLog([]); try{ const result=await sendChat(next); setToolLog(result.toolLog||[]); setMessages([...next,{role:"assistant",content:result.reply}]); await refreshFiles(); if(selected) setFileContent(await getFile(selected)); await refreshWorkspace(); } catch(err){ setMessages([...next,{role:"assistant",content:err instanceof Error ? err.message : "Something went wrong."}]); } finally{ setBusy(false); } }
  useEffect(()=>{ refreshWorkspace(); }, []);
  return <main className="app-shell"><header className="topbar"><div><h1>AgentForge Pro</h1><p>Professional AI repo fixer, builder, and tester</p></div><span className="pill">Local repo agent</span></header><WorkspacePicker current={workspace} onSet={updateWorkspace}/>{analysis && <section className="repo-summary"><span>Files: {analysis.fileCount}</span><span>Package manager: {analysis.packageManager || "unknown"}</span><span>Scripts: {Object.keys(analysis.scripts || {}).join(", ") || "none"}</span></section>}<div className="grid"><FileExplorer files={files} selected={selected} onSelect={selectFile} onRefresh={refreshFiles}/><ChatPanel messages={messages} busy={busy} toolLog={toolLog} onSend={handleSend}/><section className="panel preview"><div className="panel-header"><div className="brand-small">Code Preview</div><span className="muted">{selected || "No file selected"}</span></div><pre>{fileContent || "Select a file to preview it here."}</pre></section></div></main>;
}
