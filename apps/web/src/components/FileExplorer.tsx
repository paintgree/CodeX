import { FileCode2, RefreshCw } from "lucide-react";
type Props = { files: string[]; selected?: string; onSelect: (path: string) => void; onRefresh: () => void; };
export function FileExplorer({ files, selected, onSelect, onRefresh }: Props) {
  return <aside className="panel explorer"><div className="panel-header"><div className="brand-small">Files</div><button className="icon-button" onClick={onRefresh}><RefreshCw size={16} /></button></div><div className="file-list">{files.map((file)=><button key={file} className={`file-item ${selected === file ? "active" : ""}`} onClick={()=>!file.endsWith("/") && onSelect(file)} disabled={file.endsWith("/")}><FileCode2 size={15}/><span>{file}</span></button>)}</div></aside>;
}
