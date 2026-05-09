export type ChatMessage = { role: "user" | "assistant"; content: string; };
export type AgentResponse = { reply: string; toolLog?: string[]; };
