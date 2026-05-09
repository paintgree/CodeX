import type { ChatMessage, AgentResponse } from "@agentforge/shared";
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";
const API = `${BASE}/api`;
export async function getWorkspace() { const res = await fetch(`${API}/workspace`); return res.json(); }
export async function setWorkspace(path: string) { const res = await fetch(`${API}/workspace`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ path }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed to set workspace"); return data; }
export async function getFiles(): Promise<string[]> { const res = await fetch(`${API}/files`); const data = await res.json(); return data.files || []; }
export async function getFile(path: string): Promise<string> { const res = await fetch(`${API}/file?path=${encodeURIComponent(path)}`); const data = await res.json(); return data.content || data.error || ""; }
export async function sendChat(messages: ChatMessage[]): Promise<AgentResponse> { const res = await fetch(`${API}/chat`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ messages }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Chat failed"); return data; }
