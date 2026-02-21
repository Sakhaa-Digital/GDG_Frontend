import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authstore";

const API_BASE = "http://localhost:8000";
const POLL_INTERVAL = 5000;

/* ─── helpers ─── */
const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const fmtElapsed = (isoStr) => {
    if (!isoStr) return "";
    const ms = Date.now() - new Date(isoStr).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
};

/* ─── Status config ─── */
const STATUS_CONFIG = {
    scanning: { label: "Scanning", dot: "bg-indigo-400 animate-pulse", pill: "bg-indigo-500/10 border-indigo-500/25 text-indigo-300", pulse: true },
    running: { label: "Scanning", dot: "bg-indigo-400 animate-pulse", pill: "bg-indigo-500/10 border-indigo-500/25 text-indigo-300", pulse: true },
    queued: { label: "Queued", dot: "bg-indigo-400 animate-pulse", pill: "bg-indigo-500/10 border-indigo-500/25 text-indigo-300", pulse: true },
    completed: { label: "Done", dot: "bg-emerald-400", pill: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300", pulse: false },
    failed: { label: "Failed", dot: "bg-red-400", pill: "bg-red-500/10 border-red-500/25 text-red-400", pulse: false },
    uploaded: { label: "Uploaded", dot: "bg-slate-500", pill: "bg-slate-700/40 border-white/[0.06] text-slate-400", pulse: false },
    processing: { label: "Processing", dot: "bg-amber-400 animate-pulse", pill: "bg-amber-500/10 border-amber-500/25 text-amber-300", pulse: true },
};

function StatusPill({ status, createdAt }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.uploaded;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap ${cfg.pill}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
            {status === "completed" && createdAt && (
                <span className="opacity-60 font-normal">· {fmtElapsed(createdAt)}</span>
            )}
        </span>
    );
}

/* ─── Pulsing dot ─── */
function PulsingDot({ color = "bg-indigo-400" }) {
    return (
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
        </span>
    );
}

/* ─── Scan progress banner ─── */
function ScanBanner({ active }) {
    if (active.length === 0) return null;
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl">
            <PulsingDot />
            <div className="flex-1 min-w-0">
                <p className="text-indigo-300 text-[13px] font-semibold">
                    {active.length === 1 ? "1 dataset is being scanned" : `${active.length} datasets are being scanned`}
                </p>
                <p className="text-indigo-400/60 text-[11.5px] mt-0.5 truncate">
                    {active.map((d) => d.dataset_name || d.name).join(" · ")}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin inline-block" />
                <span className="text-indigo-400/50 text-[11px] hidden sm:block">Polling every 5s</span>
            </div>
        </div>
    );
}

/* ─── View toggle ─── */
function ViewToggle({ view, onChange }) {
    return (
        <div className="flex items-center gap-0.5 p-1 bg-white/[0.04] border border-white/[0.07] rounded-xl">
            {["grid", "table"].map((v) => (
                <button
                    key={v}
                    onClick={() => onChange(v)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${view === v
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                >
                    {v === "grid" ? (
                        <span className="flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                            Grid
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                            Table
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

/* ─── Dataset card (grid view) ─── */
function DatasetCard({ dataset, statusInfo, selected, onSelect, onScan, scanning }) {
    const status = statusInfo?.status ?? dataset.status ?? "uploaded";
    const isActive = ["scanning", "running", "queued", "processing"].includes(status);
    const isDone = status === "completed";
    const isFailed = status === "failed";
    const violations = statusInfo?.violations_count ?? dataset.violations_count ?? 0;
    const totalRows = statusInfo?.total_rows ?? dataset.total_rows ?? 0;

    return (
        <div className={`relative bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 ${isActive ? "border-indigo-500/40 shadow-[0_0_0_1px_rgba(99,102,241,0.12)]"
                : selected ? "border-indigo-500/40"
                    : "border-white/[0.07] hover:border-white/[0.12]"
            }`}>
            {/* shimmer */}
            {isActive && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        background: "linear-gradient(90deg, transparent 0%, #818cf8 50%, transparent 100%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2.2s linear infinite",
                    }} />
                </div>
            )}

            {/* top accent */}
            <div className={`h-[2px] ${isActive ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 animate-pulse"
                    : isDone ? "bg-emerald-500/50"
                        : isFailed ? "bg-red-500/50"
                            : "bg-transparent"
                }`} />

            <div className="p-4">
                {/* checkbox + status */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    <div
                        onClick={() => !isActive && !scanning && onSelect(dataset._id)}
                        className={`w-[18px] h-[18px] mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
              ${selected && !isActive ? "bg-indigo-500 border-indigo-500 cursor-pointer" : "border-white/20 cursor-pointer hover:border-indigo-400/50"}
              ${isActive || scanning ? "opacity-30 !cursor-not-allowed" : ""}`}
                    >
                        {selected && !isActive && (
                            <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </div>
                    <StatusPill status={status} createdAt={statusInfo?.created_at || dataset.created_at} />
                </div>

                {/* icon + name */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-slate-200 text-[13px] font-semibold truncate">{dataset.name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">by {dataset.uploaded_by}</p>
                    </div>
                </div>

                {/* chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-500 text-[11px] border border-white/[0.05]">
                        {fmtDate(dataset.created_at).split(" · ")[0]}
                    </span>
                    {violations > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[11px] border border-rose-500/20">
                            {violations.toLocaleString()} violations
                        </span>
                    )}
                    {totalRows > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-700/40 text-slate-500 text-[11px] border border-white/[0.05]">
                            {totalRows.toLocaleString()} rows
                        </span>
                    )}
                </div>

                {/* action row */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onScan([dataset._id])}
                        disabled={isActive || scanning}
                        className={`flex-1 py-2 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all border
              ${isActive ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 cursor-not-allowed"
                                : isDone ? "bg-white/[0.04] border-white/[0.07] text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300"
                                    : isFailed ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15"
                                        : "bg-white/[0.04] border-white/[0.07] text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300"}`}
                    >
                        {isActive ? (
                            <><span className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />Scanning…</>
                        ) : isDone ? (
                            <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>Re-scan</>
                        ) : (
                            <><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>Scan Now</>
                        )}
                    </button>
                    {dataset.file_url && (
                        <a
                            href={dataset.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl border border-white/[0.07] text-slate-500 hover:text-slate-300 hover:border-white/[0.15] transition-all flex items-center"
                            title="Download"
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Table row ─── */
function TableRow({ dataset, statusInfo, selected, onSelect, onScan, scanning, isLast }) {
    const status = statusInfo?.status ?? dataset.status ?? "uploaded";
    const isActive = ["scanning", "running", "queued", "processing"].includes(status);
    const violations = statusInfo?.violations_count ?? dataset.violations_count ?? 0;
    const totalRows = statusInfo?.total_rows ?? dataset.total_rows ?? 0;

    return (
        <tr className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${isLast ? "border-b-0" : ""}`}>
            <td className="px-5 py-3.5">
                <div
                    onClick={() => !isActive && !scanning && onSelect(dataset._id)}
                    className={`w-[16px] h-[16px] rounded-md border-2 flex items-center justify-center transition-all
            ${selected && !isActive ? "bg-indigo-500 border-indigo-500 cursor-pointer" : "border-white/20 cursor-pointer hover:border-indigo-400/50"}
            ${isActive || scanning ? "opacity-30 !cursor-not-allowed" : ""}`}
                >
                    {selected && !isActive && (
                        <svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <svg width="13" height="13" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <span className="text-slate-200 font-medium text-[13px] truncate max-w-[160px]">{dataset.name}</span>
                </div>
            </td>
            <td className="px-5 py-3.5">
                <StatusPill status={status} createdAt={statusInfo?.created_at || dataset.created_at} />
            </td>
            <td className="px-5 py-3.5">
                <span className="text-slate-300 font-mono text-[13px]">{totalRows.toLocaleString()}</span>
            </td>
            <td className="px-5 py-3.5">
                <span className={`font-mono text-[13px] font-semibold ${violations > 0 ? "text-red-400" : "text-slate-500"}`}>
                    {violations.toLocaleString()}
                </span>
            </td>
            <td className="px-5 py-3.5">
                <span className="text-slate-400 text-[12.5px]">{dataset.uploaded_by}</span>
            </td>
            <td className="px-5 py-3.5">
                <span className="text-slate-500 text-[12px]">{fmtDate(dataset.created_at)}</span>
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onScan([dataset._id])}
                        disabled={isActive || scanning}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all
              ${isActive ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 cursor-not-allowed"
                                : "bg-white/[0.04] border-white/[0.07] text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300"}`}
                    >
                        {isActive
                            ? <><span className="w-3 h-3 border border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />Scanning</>
                            : <><svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>Scan</>
                        }
                    </button>
                    {dataset.file_url && (
                        <a
                            href={dataset.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/[0.07] text-slate-400 text-[11px] hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
                        >
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            CSV
                        </a>
                    )}
                </div>
            </td>
        </tr>
    );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function DatasetManager() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const fileRef = useRef();
    const pollRef = useRef(null);

    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [selected, setSelected] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [view, setView] = useState("grid"); // "grid" | "table"

    /* ── fetch datasets ── */
    const fetchDatasets = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/dataset/`, { headers: { accept: "application/json" } });
            const data = await res.json();
            setDatasets(data.datasets || []);
        } catch {
            toast.error("Failed to load datasets.");
        } finally {
            setLoading(false);
        }
    }, []);

    /* ── fetch scan status ── */
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/dataset/status`, { headers: { accept: "application/json" } });
            const data = await res.json();
            const items = data.datasets || [];
            const map = {};
            items.forEach((d) => { map[d.dataset_id] = d; });
            setStatusMap(map);
            return items.some((d) => ["queued", "running", "scanning", "processing"].includes(d.status));
        } catch {
            return false;
        }
    }, []);

    /* ── polling ── */
    const startPolling = useCallback(() => {
        if (pollRef.current) return;
        pollRef.current = setInterval(async () => {
            const stillActive = await fetchStatus();
            if (!stillActive) {
                clearInterval(pollRef.current);
                pollRef.current = null;
                fetchDatasets();
                toast.success("All scans completed!", { icon: "✅" });
            }
        }, POLL_INTERVAL);
    }, [fetchStatus, fetchDatasets]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }, []);

    useEffect(() => {
        fetchDatasets();
        fetchStatus().then((active) => { if (active) startPolling(); });
        return () => stopPolling();
    }, [fetchDatasets, fetchStatus, startPolling, stopPolling]);

    /* ── upload ── */
    const handleUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const adminId = user?._id || user?.email || "admin123";
        const form = new FormData();
        form.append("file", file);
        try {
            const res = await fetch(`${API_BASE}/dataset/?admin_id=${adminId}`, { method: "POST", body: form });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Uploaded! ID: ${data.dataset_id}`);
                fetchDatasets();
            } else {
                toast.error("Upload failed");
            }
        } catch {
            toast.error("Upload error — check server");
        } finally {
            setUploading(false);
        }
    };

    /* ── scan ── */
    const runScan = async (datasetIds) => {
        const userId = user?._id || user?.email || "admin123";
        setScanning(true);
        const toastId = toast.loading(
            datasetIds.length === 1 ? "Starting scan…" : `Starting batch scan for ${datasetIds.length} datasets…`
        );
        try {
            const res = await fetch(`${API_BASE}/scan/batch-scan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dataset_ids: datasetIds, scanned_by: userId }),
            });
            if (!res.ok) throw new Error("Scan request failed");
            toast.success("Scan queued! Monitoring…", { id: toastId });
            setSelected([]);
            await fetchStatus();
            startPolling();
        } catch (e) {
            toast.error(e.message || "Scan failed.", { id: toastId });
        } finally {
            setScanning(false);
        }
    };

    /* ── selection helpers ── */
    const handleToggleSelect = (id) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const activeIds = new Set(
        Object.entries(statusMap)
            .filter(([, v]) => ["queued", "running", "scanning", "processing"].includes(v.status))
            .map(([id]) => id)
    );
    const activeDatasets = Object.values(statusMap).filter((d) =>
        ["queued", "running", "scanning", "processing"].includes(d.status)
    );
    const scannableSelected = selected.filter((id) => !activeIds.has(id));
    const allScannable = datasets.filter((d) => !activeIds.has(d._id));
    const allSelected = allScannable.length > 0 && scannableSelected.length === allScannable.length;

    const handleSelectAll = () => {
        setSelected(allSelected ? [] : allScannable.map((d) => d._id));
    };

    /* ── stats ── */
    const stats = {
        total: datasets.length,
        completed: datasets.filter((d) => (statusMap[d._id]?.status ?? d.status) === "completed").length,
        active: activeDatasets.length,
        violations: datasets.reduce((acc, d) => acc + (statusMap[d._id]?.violations_count ?? d.violations_count ?? 0), 0),
    };

    return (
        <>
            <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

            <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 gap-6">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-[3px] w-7 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                            <span className="text-slate-500 text-[10.5px] tracking-[1.5px] uppercase font-semibold">Compliance</span>
                        </div>
                        <h1 className="text-[22px] font-bold text-slate-100 tracking-tight">Dataset Manager</h1>
                        <p className="text-slate-500 text-[13px] mt-0.5">Upload datasets and scan against active policies</p>
                    </div>

                    <button
                        onClick={() => scannableSelected.length > 0 ? runScan(scannableSelected) : null}
                        disabled={scannableSelected.length === 0 || scanning}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all border
              ${scannableSelected.length > 0 && !scanning
                                ? "bg-indigo-500 border-indigo-600 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
                                : "bg-white/[0.04] border-white/[0.07] text-slate-500 cursor-not-allowed"}`}
                    >
                        {scanning ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Starting…</>
                        ) : (
                            <><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                {scannableSelected.length > 0 ? `Scan ${scannableSelected.length} Selected` : "Select to Scan"}</>
                        )}
                    </button>
                </div>

                {/* ── Stats row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Datasets", value: stats.total, color: "text-slate-200" },
                        { label: "Completed Scans", value: stats.completed, color: "text-emerald-400" },
                        { label: "Active Scans", value: stats.active, color: "text-indigo-400" },
                        { label: "Total Violations", value: stats.violations, color: stats.violations > 0 ? "text-red-400" : "text-slate-400" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                            <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wide mb-1">{label}</p>
                            <p className={`text-2xl font-bold font-mono ${color}`}>{value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* ── Scan banner ── */}
                <ScanBanner active={activeDatasets} />

                {/* ── Upload zone ── */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
            ${dragActive ? "border-indigo-400 bg-indigo-500/[0.08]" : "border-white/[0.09] bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/[0.04]"}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
                    <div className="flex flex-col items-center justify-center py-8 px-6 text-center relative z-10">
                        {uploading ? (
                            <>
                                <div className="w-10 h-10 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin mb-3" />
                                <p className="text-slate-300 font-semibold text-sm">Uploading dataset…</p>
                                <p className="text-slate-500 text-xs mt-0.5">Please wait</p>
                            </>
                        ) : (
                            <>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all ${dragActive ? "bg-indigo-500/20 scale-110" : "bg-white/[0.05]"}`}>
                                    <svg width="22" height="22" fill="none" stroke={dragActive ? "#818cf8" : "#64748b"} strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="text-slate-200 font-semibold text-sm mb-0.5">
                                    {dragActive ? "Drop your CSV here" : "Upload a Dataset"}
                                </p>
                                <p className="text-slate-500 text-xs">
                                    Drag & drop or <span className="text-indigo-400 font-medium">click to browse</span> · CSV only
                                </p>
                            </>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
                </div>

                {/* ── Toolbar ── */}
                {!loading && datasets.length > 0 && (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* left: select all */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <div
                                onClick={handleSelectAll}
                                className={`w-[16px] h-[16px] rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
                  ${allSelected ? "bg-indigo-500 border-indigo-500" : "border-white/20 hover:border-indigo-400/50"}`}
                            >
                                {allSelected && (
                                    <svg width="9" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-slate-400 text-[13px]">{allSelected ? "Deselect all" : "Select all"}</span>
                        </label>

                        {/* right: chips + view toggle */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {scannableSelected.length > 0 && (
                                <span className="text-slate-500 text-[12px]">{scannableSelected.length} selected</span>
                            )}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
                                <span className="text-slate-500 text-[12px]">{datasets.length} datasets</span>
                            </div>
                            {activeDatasets.length > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <PulsingDot />
                                    <span className="text-indigo-300 text-[12px] font-medium">{activeDatasets.length} scanning</span>
                                </div>
                            )}
                            <button onClick={fetchDatasets} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-slate-400 hover:text-slate-200 text-[12px] transition-all">
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                                Refresh
                            </button>
                            <ViewToggle view={view} onChange={setView} />
                        </div>
                    </div>
                )}

                {/* ── Content ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-52 rounded-2xl bg-white/[0.04] animate-pulse" />
                        ))}
                    </div>
                ) : datasets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                            <svg width="28" height="28" fill="none" stroke="#475569" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-[14px]">No datasets yet. Upload a CSV to get started.</p>
                    </div>
                ) : view === "grid" ? (
                    /* ── Grid view ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {datasets.map((dataset) => (
                            <DatasetCard
                                key={dataset._id}
                                dataset={dataset}
                                statusInfo={statusMap[dataset._id] ?? null}
                                selected={selected.includes(dataset._id)}
                                onSelect={handleToggleSelect}
                                onScan={runScan}
                                scanning={scanning}
                            />
                        ))}
                    </div>
                ) : (
                    /* ── Table view ── */
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/[0.05]">
                                        <th className="px-5 py-3.5 w-10" />
                                        {["Dataset Name", "Status", "Rows", "Violations", "Uploaded By", "Created At", "Actions"].map((h) => (
                                            <th key={h} className="text-left text-[10.5px] font-semibold text-slate-500 tracking-[0.8px] uppercase px-5 py-3.5">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {datasets.map((dataset, idx) => (
                                        <TableRow
                                            key={dataset._id}
                                            dataset={dataset}
                                            statusInfo={statusMap[dataset._id] ?? null}
                                            selected={selected.includes(dataset._id)}
                                            onSelect={handleToggleSelect}
                                            onScan={runScan}
                                            scanning={scanning}
                                            isLast={idx === datasets.length - 1}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                            <span className="text-slate-600 text-[11.5px]">
                                Showing {datasets.length} dataset{datasets.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-slate-600 text-[11.5px]">
                                {stats.completed} completed · {stats.active} active
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Legend ── */}
                {!loading && datasets.length > 0 && (
                    <div className="flex items-center gap-5 pt-2 border-t border-white/[0.04] flex-wrap">
                        <p className="text-slate-600 text-[11px] font-medium uppercase tracking-wider">Legend</p>
                        {[
                            { color: "bg-indigo-400", label: "Scanning" },
                            { color: "bg-emerald-400", label: "Completed" },
                            { color: "bg-red-400", label: "Failed" },
                            { color: "bg-amber-400", label: "Processing" },
                            { color: "bg-slate-600", label: "Not scanned" },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                                <span className="text-slate-600 text-[11.5px]">{label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}