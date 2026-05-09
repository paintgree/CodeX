import { FolderCog } from "lucide-react";
import { useState } from "react";
type Props = { current?: string; onSet: (path: string) => Promise<void>; };
export function WorkspacePicker({ current, onSet }: Props) {
  const [path, setPath] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit() { if (!path.trim()) return; setBusy(true); setError(""); try { await onSet(path.trim()); setPath(""); } catch (err) { setError(err instanceof Error ? err.message : "Failed"); } finally { setBusy(false); } }
  return <section className="workspace-picker"><div className="brand-small"><FolderCog size={18} /> Selected repo</div><p>{current || "No workspace selected"}</p><div className="path-row"><input value={path} onChange={(e)=>setPath(e.target.value)} placeholder={'Paste repo path, example: /Users/you/my-app or C:\\Users\\you\\my-app'} /><button onClick={submit} disabled={busy || !path.trim()}>{busy ? "Setting..." : "Set Workspace"}</button></div>{error && <p className="error">{error}</p>}</section>;
}
