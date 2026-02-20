import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authstore";

const API_BASE = "http://localhost:8000";
const POLL_INTERVAL = 5000;

/* ─── helpers ─── */
const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtElapsed = (isoStr) => {
    if (!isoStr) return "";
    const ms = Date.now() - new Date(isoStr).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
};

/* ─── tiny components ─── */
function PulsingDot({ color = "bg-indigo-400" }) {
    return (
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
        </span>
    );
}

function StatusPill({ status, createdAt }) {
    if (status === "queued") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[11px] font-semibold whitespace-nowrap">
                <PulsingDot color="bg-indigo-400" />
                Scanning
            </span>
        );
    }
    if (status === "completed") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Done · {fmtElapsed(createdAt)}
            </span>
        );
    }
    if (status === "failed") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-[11px] font-semibold whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Failed
            </span>
        );
    }
    // uploaded / unknown
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/40 border border-white/[0.06] text-slate-500 text-[11px] font-medium whitespace-nowrap capitalize">
            {status ?? "ready"}
        </span>
    );
}

/* ─── Active banner shown when any datasets are queued ─── */
function ScanBanner({ queuedDatasets }) {
    if (queuedDatasets.length === 0) return null;
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl">
            <PulsingDot color="bg-indigo-400" />
            <div className="flex-1 min-w-0">
                <p className="text-indigo-300 text-[13px] font-semibold">
                    {queuedDatasets.length === 1
                        ? "1 dataset is being scanned"
                        : `${queuedDatasets.length} datasets are being scanned`}
                </p>
                <p className="text-indigo-400/60 text-[11.5px] mt-0.5 truncate">
                    {queuedDatasets.map((d) => d.dataset_name).join(" · ")}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin inline-block" />
                <span className="text-indigo-400/50 text-[11px]">Polling every 5s</span>
            </div>
        </div>
    );
}

/* ─── Dataset card ─── */
function DatasetCard({ dataset, statusInfo, selected, onSelect, onScan, scanning }) {
    const status = statusInfo?.status ?? dataset.status ?? "uploaded";
    const isQueued = status === "queued";
    const isDone = status === "completed";
    const isFailed = status === "failed";
    const violations = statusInfo?.violations_count ?? dataset.violations_count ?? 0;

    return (
        <div
            className={`relative bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200
        ${isQueued
                    ? "border-indigo-500/40 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]"
                    : selected
                        ? "border-indigo-500/40"
                        : "border-white/[0.07]"
                }`}
        >
            {/* shimmer overlay when scanning */}
            {isQueued && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <div
                        className="absolute inset-0 opacity-[0.035]"
                        style={{
                            background: "linear-gradient(90deg, transparent 0%, #818cf8 50%, transparent 100%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 2.2s linear infinite",
                        }}
                    />
                </div>
            )}

            {/* top accent bar */}
            <div
                className={`h-[2px] ${isQueued
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                        : isDone
                            ? "bg-emerald-500/50"
                            : isFailed
                                ? "bg-red-500/50"
                                : "bg-transparent"
                    } ${isQueued ? "animate-pulse" : ""}`}
            />

            <div className="p-4">
                {/* checkbox + status */}
                <div className="flex items-start justify-between mb-3 gap-2">
                    <div
                        onClick={() => !isQueued && !scanning && onSelect(dataset._id)}
                        className={`w-[18px] h-[18px] mt-0.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
              ${selected && !isQueued ? "bg-indigo-500 border-indigo-500 cursor-pointer" : "border-white/20 cursor-pointer hover:border-indigo-400/50"}
              ${isQueued || scanning ? "opacity-30 !cursor-not-allowed" : ""}`}
                    >
                        {selected && !isQueued && (
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
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-slate-200 text-[13px] font-semibold truncate">{dataset.name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">by {dataset.uploaded_by}</p>
                    </div>
                </div>

                {/* meta chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-500 text-[11px] border border-white/[0.05]">
                        {fmtDate(dataset.created_at)}
                    </span>
                    {violations > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[11px] border border-rose-500/20">
                            {violations.toLocaleString()} violations
                        </span>
                    )}
                    {statusInfo?.total_rows > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-700/40 text-slate-500 text-[11px] border border-white/[0.05]">
                            {statusInfo.total_rows.toLocaleString()} rows
                        </span>
                    )}
                </div>

                {/* action button */}
                <button
                    onClick={() => onScan([dataset._id])}
                    disabled={isQueued || scanning}
                    className={`w-full py-2 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all border
            ${isQueued
                            ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400 cursor-not-allowed"
                            : isDone
                                ? "bg-white/[0.04] border-white/[0.07] text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300"
                                : isFailed
                                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15"
                                    : "bg-white/[0.04] border-white/[0.07] text-slate-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300"
                        }`}
                >
                    {isQueued ? (
                        <>
                            <span className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                            Scanning…
                        </>
                    ) : isDone ? (
                        <>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            Re-scan
                        </>
                    ) : (
                        <>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            Scan Now
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function ScanDatasets() {
    const { user } = useAuthStore();
    const [datasets, setDatasets] = useState([]);
    const [loadingDatasets, setLoadingDatasets] = useState(true);

    // server-driven status map: { [dataset_id]: { status, violations_count, total_rows, ... } }
    const [statusMap, setStatusMap] = useState({});
    const [scanning, setScanning] = useState(false);
    const [selected, setSelected] = useState([]);
    const pollRef = useRef(null);

    /* ── fetch all datasets ── */
    const fetchDatasets = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/dataset/`, { headers: { accept: "application/json" } });
            const data = await res.json();
            setDatasets(data.datasets || []);
        } catch {
            toast.error("Failed to load datasets.");
        } finally {
            setLoadingDatasets(false);
        }
    }, []);

    /* ── fetch status for all datasets ── */
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/dataset/status`, { headers: { accept: "application/json" } });
            const data = await res.json();
            const items = data.datasets || [];

            const map = {};
            items.forEach((d) => { map[d.dataset_id] = d; });
            setStatusMap(map);

            // if any are still queued → keep polling; else stop
            const anyQueued = items.some((d) => d.status === "queued");
            return anyQueued;
        } catch {
            return false; // stop polling on error
        }
    }, []);

    /* ── start / stop polling ── */
    const startPolling = useCallback(() => {
        if (pollRef.current) return; // already polling
        pollRef.current = setInterval(async () => {
            const stillQueued = await fetchStatus();
            if (!stillQueued) {
                clearInterval(pollRef.current);
                pollRef.current = null;
                // refresh dataset list too so violations_count etc update
                fetchDatasets();
                toast.success("All scans completed!", { icon: "✅" });
            }
        }, POLL_INTERVAL);
    }, [fetchStatus, fetchDatasets]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    /* ── on mount: load datasets + check status ── */
    useEffect(() => {
        fetchDatasets();
        fetchStatus().then((anyQueued) => {
            if (anyQueued) startPolling();
        });
        return () => stopPolling();
    }, [fetchDatasets, fetchStatus, startPolling, stopPolling]);

    /* ── run scan ── */
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
            const data = await res.json();
            console.log("Scan results:", data.results);

            toast.success("Scan queued! Monitoring progress…", { id: toastId });
            setSelected([]);

            // immediately hit status to show queued state, then start polling
            await fetchStatus();
            startPolling();
        } catch (e) {
            toast.error(e.message || "Scan failed. Try again.", { id: toastId });
        } finally {
            setScanning(false);
        }
    };

    /* ── selection helpers ── */
    const handleToggleSelect = (id) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const queuedIds = new Set(
        Object.entries(statusMap).filter(([, v]) => v.status === "queued").map(([id]) => id)
    );
    const queuedDatasets = Object.values(statusMap).filter((d) => d.status === "queued");

    const scannableSelected = selected.filter((id) => !queuedIds.has(id));
    const allScannable = datasets.filter((d) => !queuedIds.has(d._id));
    const allSelected = allScannable.length > 0 && scannableSelected.length === allScannable.length;

    const handleSelectAll = () => {
        setSelected(allSelected ? [] : allScannable.map((d) => d._id));
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

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-[22px] font-bold text-slate-100 tracking-tight">Dataset Scanner</h1>
                        <p className="text-slate-500 text-[13px] mt-0.5">
                            Scan datasets against active policies to detect violations
                        </p>
                    </div>

                    <button
                        onClick={() => runScan(scannableSelected)}
                        disabled={scannableSelected.length === 0 || scanning}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all border
              ${scannableSelected.length > 0 && !scanning
                                ? "bg-indigo-500 border-indigo-600 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
                                : "bg-white/[0.04] border-white/[0.07] text-slate-500 cursor-not-allowed"
                            }`}
                    >
                        {scanning ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Starting…
                            </>
                        ) : (
                            <>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                {scannableSelected.length > 0
                                    ? `Scan ${scannableSelected.length} Selected`
                                    : "Select datasets to scan"}
                            </>
                        )}
                    </button>
                </div>

                {/* Active scan banner — server driven */}
                <ScanBanner queuedDatasets={queuedDatasets} />

                {/* Toolbar */}
                {!loadingDatasets && datasets.length > 0 && (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <div
                                onClick={handleSelectAll}
                                className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
                  ${allSelected ? "bg-indigo-500 border-indigo-500" : "border-white/20 hover:border-indigo-400/50"}`}
                            >
                                {allSelected && (
                                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-slate-400 text-[13px]">
                                {allSelected ? "Deselect all" : "Select all"}
                            </span>
                        </label>

                        <div className="flex items-center gap-2 flex-wrap">
                            {scannableSelected.length > 0 && (
                                <span className="text-slate-500 text-[12.5px]">{scannableSelected.length} selected</span>
                            )}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
                                <span className="text-slate-500 text-[12px]">{datasets.length} total</span>
                            </div>
                            {queuedDatasets.length > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <PulsingDot color="bg-indigo-400" />
                                    <span className="text-indigo-300 text-[12px] font-medium">
                                        {queuedDatasets.length} scanning
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Dataset grid */}
                {loadingDatasets ? (
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
                        <p className="text-slate-500 text-[14px]">No datasets found. Upload a CSV to get started.</p>
                    </div>
                ) : (
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
                )}

                {/* Legend */}
                {!loadingDatasets && datasets.length > 0 && (
                    <div className="flex items-center gap-5 pt-2 border-t border-white/[0.04] flex-wrap">
                        <p className="text-slate-600 text-[11px] font-medium uppercase tracking-wider">Legend</p>
                        {[
                            { color: "bg-indigo-400", label: "Scanning (queued)" },
                            { color: "bg-emerald-400", label: "Completed" },
                            { color: "bg-red-400", label: "Failed" },
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