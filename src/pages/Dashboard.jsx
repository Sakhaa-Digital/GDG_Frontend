import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:8000";

function AnimatedNumber({ value, duration = 1200 }) {
    const [display, setDisplay] = useState(0);
    const startRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (value === 0) return;
        startRef.current = null;
        const animate = (ts) => {
            if (!startRef.current) startRef.current = ts;
            const progress = Math.min((ts - startRef.current) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setDisplay(Math.floor(ease * value));
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [value, duration]);

    return <>{display.toLocaleString()}</>;
}

function SeverityBar({ high, medium, low }) {
    const total = (high || 0) + (medium || 0) + (low || 0);
    const highPct = total ? ((high || 0) / total) * 100 : 0;
    const medPct = total ? ((medium || 0) / total) * 100 : 0;
    const lowPct = total ? ((low || 0) / total) * 100 : 0;
    return (
        <div className="flex flex-col gap-3">
            <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.06]">
                <div
                    style={{ width: `${highPct}%`, transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }}
                    className="bg-gradient-to-r from-red-500 to-rose-400"
                />
                <div
                    style={{ width: `${medPct}%`, transition: "width 1.2s cubic-bezier(.16,1,.3,1) 0.1s" }}
                    className="bg-gradient-to-r from-amber-400 to-yellow-300"
                />
                <div
                    style={{ width: `${lowPct}%`, transition: "width 1.2s cubic-bezier(.16,1,.3,1) 0.2s" }}
                    className="bg-gradient-to-r from-sky-500 to-cyan-400"
                />
            </div>
            <div className="flex gap-5 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-red-500 to-rose-400 inline-block" />
                    <span className="text-slate-400 text-[12px]">
                        High <span className="text-rose-300 font-semibold">{(high || 0).toLocaleString()}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 inline-block" />
                    <span className="text-slate-400 text-[12px]">
                        Medium <span className="text-amber-300 font-semibold">{(medium || 0).toLocaleString()}</span>
                    </span>
                </div>
                {(low || 0) > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 inline-block" />
                        <span className="text-slate-400 text-[12px]">
                            Low <span className="text-sky-300 font-semibold">{low.toLocaleString()}</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, accent, sub, delay = 0 }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div
            className="relative bg-slate-900 border border-white/[0.07] rounded-2xl p-5 overflow-hidden group"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(18px)",
                transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.16,1,.3,1)",
            }}
        >
            <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${accent}`} />
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent} bg-opacity-15`}>
                    {icon}
                </div>
            </div>
            <p className="text-slate-400 text-[12px] font-medium tracking-wide uppercase mb-1">{label}</p>
            <p className="text-slate-100 text-[28px] font-bold tracking-tight leading-none">
                <AnimatedNumber value={typeof value === "number" ? value : 0} />
            </p>
            {sub && <p className="text-slate-500 text-[11.5px] mt-1.5">{sub}</p>}
        </div>
    );
}

function SeverityBadge({ severity }) {
    if (severity === "high")
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[11px] font-semibold border border-red-500/20 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                High
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-semibold border border-amber-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Medium
        </span>
    );
}

function StatusBadge({ status }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 text-[11px] font-medium border border-white/[0.06] whitespace-nowrap capitalize">
            {status ?? "—"}
        </span>
    );
}

/* ── Detail Modal ── */
function DetailModal({ violation, onClose }) {
    useEffect(() => {
        const handler = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    if (!violation) return null;

    const rowData = violation.row_data ?? {};
    const rowKeys = Object.keys(rowData);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative bg-slate-900 border border-white/[0.09] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                style={{ animation: "modalIn 0.22s cubic-bezier(.16,1,.3,1)" }}
            >
                <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}`}</style>

                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                            <svg width="16" height="16" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-200 font-semibold text-[14px]">Violation Detail</p>
                            <p className="text-slate-500 text-[11px] font-mono mt-0.5 truncate max-w-[240px]">{violation._id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">

                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <SeverityBadge severity={violation.severity} />
                        <StatusBadge status={violation.status} />
                        <span className="text-slate-500 text-[11px] ml-auto">
                            {violation.created_at ? new Date(violation.created_at).toLocaleString() : ""}
                        </span>
                    </div>

                    {/* Row Data — fully dynamic, no hardcoded keys */}
                    <div>
                        <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase mb-3">Row Data</p>
                        {rowKeys.length === 0 ? (
                            <p className="text-slate-600 text-[13px]">No row data available.</p>
                        ) : (
                            <div className="rounded-xl border border-white/[0.07] overflow-hidden">
                                {rowKeys.map((key, idx) => (
                                    <div
                                        key={key}
                                        className={`flex items-start gap-3 px-4 py-2.5 ${idx !== rowKeys.length - 1 ? "border-b border-white/[0.05]" : ""
                                            } ${idx % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                                    >
                                        <span className="text-slate-500 text-[12px] font-medium capitalize min-w-[140px] pt-px shrink-0">
                                            {key.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-slate-200 text-[12.5px] font-mono break-all">
                                            {String(rowData[key] ?? "—")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rule */}
                    {violation.rule && (
                        <div>
                            <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase mb-3">Rule</p>
                            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 flex flex-col gap-1.5">
                                <p className="text-slate-300 text-[13px]">{violation.rule.rule_text ?? "—"}</p>
                                <p className="text-slate-600 text-[11px] font-mono">{violation.rule.rule_id}</p>
                            </div>
                        </div>
                    )}

                    {/* Policy + Dataset */}
                    <div className="grid grid-cols-2 gap-3">
                        {violation.policy && (
                            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Policy</p>
                                <p className="text-slate-300 text-[12.5px] font-medium truncate">{violation.policy.name}</p>
                            </div>
                        )}
                        {violation.dataset && (
                            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Dataset</p>
                                <p className="text-slate-300 text-[12.5px] font-medium truncate">{violation.dataset.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Scan info */}
                    {violation.scan && (
                        <div>
                            <p className="text-slate-400 text-[11px] font-semibold tracking-widest uppercase mb-3">Scan Info</p>
                            <div className="rounded-xl border border-white/[0.07] overflow-hidden">
                                {[
                                    ["Status", violation.scan.status],
                                    ["Rows Scanned", Number(violation.scan.total_rows_scanned ?? 0).toLocaleString()],
                                    ["Violations Found", Number(violation.scan.violations_found ?? 0).toLocaleString()],
                                    ["Started", violation.scan.started_at ? new Date(violation.scan.started_at).toLocaleString() : "—"],
                                    ["Completed", violation.scan.completed_at ? new Date(violation.scan.completed_at).toLocaleString() : "—"],
                                ].map(([k, v], idx, arr) => (
                                    <div
                                        key={k}
                                        className={`flex items-center gap-3 px-4 py-2.5 ${idx !== arr.length - 1 ? "border-b border-white/[0.05]" : ""
                                            } ${idx % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                                    >
                                        <span className="text-slate-500 text-[12px] font-medium min-w-[130px]">{k}</span>
                                        <span className="text-slate-200 text-[12.5px] font-mono capitalize">{String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   Main Dashboard
══════════════════════════════════════════ */
export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [violations, setViolations] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("");
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingViolations, setLoadingViolations] = useState(true);
    const [page, setPage] = useState(0);
    const [totalViolations, setTotalViolations] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const limit = 20;

    useEffect(() => {
        fetch(`${API_BASE}/violation/dashboard-stats`)
            .then((r) => r.json())
            .then(setStats)
            .finally(() => setLoadingStats(false));

        fetch(`${API_BASE}/dataset/`)
            .then((r) => r.json())
            .then((d) => setDatasets(d.datasets || []));
    }, []);

    useEffect(() => {
        setLoadingViolations(true);
        const skip = page * limit;
        let url = `${API_BASE}/violation/?skip=${skip}&limit=${limit}&populate_rules=false`;
        if (selectedDataset) url += `&dataset_id=${selectedDataset}`;
        if (selectedSeverity) url += `&severity=${selectedSeverity}`;
        fetch(url)
            .then((r) => r.json())
            .then((d) => {
                const items = Array.isArray(d) ? d : d.violations || d.data || [];
                setViolations(items);
                setTotalViolations(d.total ?? items.length);
                setHasMore(d.has_more ?? items.length === limit);
            })
            .finally(() => setLoadingViolations(false));
    }, [selectedDataset, selectedSeverity, page]);

    const handleDatasetChange = (id) => {
        setSelectedDataset(id);
        setPage(0);
    };

    const handleSeverityChange = (val) => {
        setSelectedSeverity(val);
        setPage(0);
    };

    const high = stats?.severity_summary?.high ?? 0;
    const medium = stats?.severity_summary?.medium ?? 0;
    const low = stats?.severity_summary?.low ?? 0;
    const total = stats?.total_violations ?? 0;
    const policyCount = Object.keys(stats?.policies_summary ?? {}).length;
    const datasetCount = Object.keys(stats?.datasets_summary ?? {}).length;

    const startRow = page * limit + 1;
    const endRow = page * limit + violations.length;

    return (
        <>
            {selectedViolation && (
                <DetailModal violation={selectedViolation} onClose={() => setSelectedViolation(null)} />
            )}

            <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 gap-7">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[22px] font-bold text-slate-100 tracking-tight">Violation Dashboard</h1>
                        <p className="text-slate-500 text-[13px] mt-0.5">Monitor policy violations across all datasets</p>
                    </div>
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-400 text-[12.5px] font-medium">Live</span>
                    </div>
                </div>

                {/* Stat Cards */}
                {loadingStats ? (
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-white/[0.04] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                        <StatCard
                            label="Total Violations"
                            value={total}
                            delay={0}
                            accent="bg-indigo-500"
                            sub="Across all datasets"
                            icon={
                                <svg width="18" height="18" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="High Severity"
                            value={high}
                            delay={80}
                            accent="bg-rose-500"
                            sub={`${total ? ((high / total) * 100).toFixed(1) : 0}% of total`}
                            icon={
                                <svg width="18" height="18" fill="none" stroke="#f43f5e" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Medium Severity"
                            value={medium}
                            delay={160}
                            accent="bg-amber-400"
                            sub={`${total ? ((medium / total) * 100).toFixed(1) : 0}% of total`}
                            icon={
                                <svg width="18" height="18" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Low Severity"
                            value={low}
                            delay={220}
                            accent="bg-sky-400"
                            sub={`${total ? ((low / total) * 100).toFixed(1) : 0}% of total`}
                            icon={
                                <svg width="18" height="18" fill="none" stroke="#38bdf8" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Policies Active"
                            value={policyCount}
                            delay={300}
                            accent="bg-cyan-400"
                            sub={`${datasetCount} dataset(s) affected`}
                            icon={
                                <svg width="18" height="18" fill="none" stroke="#22d3ee" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                </svg>
                            }
                        />
                    </div>
                )}

                {/* Severity Breakdown */}
                {!loadingStats && stats && (
                    <div className="bg-slate-900 border border-white/[0.07] rounded-2xl p-5">
                        <p className="text-slate-300 text-[13.5px] font-semibold mb-4">Severity Breakdown</p>
                        <SeverityBar high={high} medium={medium} low={low} />
                    </div>
                )}

                {/* Table Section */}
                <div className="bg-slate-900 border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] gap-4 flex-wrap">
                        <div>
                            <p className="text-slate-200 font-semibold text-[14px]">Violation Records</p>
                            <p className="text-slate-500 text-[12px] mt-0.5">
                                {loadingViolations
                                    ? "Loading…"
                                    : `${startRow}–${endRow} of ${totalViolations.toLocaleString()} records`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <svg width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>

                            {/* Severity filter */}
                            <div className="relative">
                                <select
                                    value={selectedSeverity}
                                    onChange={(e) => handleSeverityChange(e.target.value)}
                                    className={`appearance-none bg-slate-800 border text-[12.5px] rounded-xl pl-3.5 pr-8 py-2 cursor-pointer outline-none transition-all
                    ${selectedSeverity === "high"
                                            ? "border-rose-500/40 text-rose-300 focus:border-rose-500/60"
                                            : selectedSeverity === "medium"
                                                ? "border-amber-500/40 text-amber-300 focus:border-amber-500/60"
                                                : selectedSeverity === "low"
                                                    ? "border-sky-500/40 text-sky-300 focus:border-sky-500/60"
                                                    : "border-white/[0.08] text-slate-300 focus:border-indigo-500/50"
                                        }`}
                                >
                                    <option value="">All Severities</option>
                                    <option value="high">🔴 High</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="low">🔵 Low</option>
                                </select>
                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            {/* Dataset filter */}
                            <div className="relative">
                                <select
                                    value={selectedDataset}
                                    onChange={(e) => handleDatasetChange(e.target.value)}
                                    className="appearance-none bg-slate-800 border border-white/[0.08] text-slate-300 text-[12.5px] rounded-xl pl-3.5 pr-8 py-2 cursor-pointer outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                >
                                    <option value="">All Datasets</option>
                                    {datasets.map((ds) => (
                                        <option key={ds._id} value={ds._id}>
                                            {ds.name}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            {/* Active filter chips */}
                            {(selectedSeverity || selectedDataset) && (
                                <button
                                    onClick={() => { setSelectedSeverity(""); setSelectedDataset(""); setPage(0); }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-500 text-[11.5px] hover:text-slate-300 hover:bg-white/[0.07] transition-all"
                                >
                                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table — columns are generic, not tied to any CSV schema */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                            <thead>
                                <tr className="border-b border-white/[0.05]">
                                    {["#", "Violation ID", "Severity", "Status", "Policy", "Dataset", "Created", "Action"].map((h) => (
                                        <th key={h} className="px-5 py-3 text-slate-500 font-semibold text-[11px] tracking-wider uppercase whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loadingViolations ? (
                                    [...Array(8)].map((_, i) => (
                                        <tr key={i} className="border-b border-white/[0.03]">
                                            {[...Array(8)].map((_, j) => (
                                                <td key={j} className="px-5 py-3.5">
                                                    <div className="h-3.5 rounded bg-white/[0.05] animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : violations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                                                    <svg width="22" height="22" fill="none" stroke="#475569" strokeWidth="1.5" viewBox="0 0 24 24">
                                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-500 text-[13px]">No violations found for the selected filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    violations.map((v, i) => (
                                        <tr
                                            key={v._id || i}
                                            className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors"
                                        >
                                            <td className="px-5 py-3.5 text-slate-600 text-[12px] font-mono">
                                                {page * limit + i + 1}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-slate-400 font-mono text-[11.5px]" title={v._id}>
                                                    {v._id ? `${v._id.slice(0, 10)}…` : "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <SeverityBadge severity={v.severity} />
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusBadge status={v.status} />
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 text-[12.5px] max-w-[130px] truncate">
                                                {v.policy?.name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400 text-[12.5px] max-w-[160px] truncate">
                                                {v.dataset?.name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 text-[12px] whitespace-nowrap">
                                                {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={() => setSelectedViolation(v)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-indigo-400 border border-indigo-500/25 bg-indigo-500/[0.07] hover:bg-indigo-500/[0.15] hover:border-indigo-500/40 transition-all whitespace-nowrap"
                                                >
                                                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.05]">
                        <span className="text-slate-500 text-[12px]">
                            Page {page + 1} · {totalViolations.toLocaleString()} total
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium border border-white/[0.07] text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-all"
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                                Prev
                            </button>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasMore}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium border border-white/[0.07] text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.04] transition-all"
                            >
                                Next
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}