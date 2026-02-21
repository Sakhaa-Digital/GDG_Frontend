import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authstore";

const API_BASE = "http://localhost:8000";

/* ─── helpers ─── */
const isImage = (t) => t && t.startsWith("image/");

const fileTypeLabel = (t) => {
    if (!t) return "FILE";
    if (t.includes("pdf")) return "PDF";
    if (t.includes("jpeg") || t.includes("jpg")) return "JPEG";
    if (t.includes("png")) return "PNG";
    if (t.includes("word") || t.includes("docx")) return "DOCX";
    if (t.includes("text")) return "TXT";
    return t.split("/")[1]?.toUpperCase() || "FILE";
};

const fileTypeColor = (t) => {
    if (!t) return "text-slate-400 bg-slate-800 border-slate-700";
    if (t.includes("pdf")) return "text-red-400 bg-red-500/10 border-red-500/20";
    if (t.includes("png") || t.includes("jpg") || t.includes("jpeg"))
        return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    if (t.includes("word") || t.includes("docx"))
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (t.includes("text")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-slate-400 bg-slate-800 border-slate-700";
};

const FileIcon = ({ sourceType, size = 20 }) => {
    const color =
        sourceType?.includes("pdf") ? "#f87171" :
            sourceType?.includes("png") || sourceType?.includes("jpg") ? "#38bdf8" :
                sourceType?.includes("word") || sourceType?.includes("docx") ? "#60a5fa" :
                    "#94a3b8";

    return (
        <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            {sourceType?.includes("pdf") && (
                <text x="6" y="18" fontSize="5" fill={color} stroke="none" fontWeight="bold">PDF</text>
            )}
        </svg>
    );
};

const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ─── Policy Card ─── */
function PolicyCard({ policy, onView, onDelete, onToggle, toggling }) {
    return (
        <div className={`group relative bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200
      ${policy.active
                ? "border-white/[0.08] hover:border-white/[0.14]"
                : "border-white/[0.04] opacity-50 hover:opacity-70"}`}
        >
            {/* active accent bar */}
            {policy.active && (
                <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />
            )}

            {/* thumbnail / preview area */}
            <div
                className="relative w-full h-32 bg-slate-800/60 flex items-center justify-center cursor-pointer overflow-hidden border-b border-white/[0.05]"
                onClick={onView}
            >
                {isImage(policy.source_type) ? (
                    <img
                        src={policy.file_path}
                        alt={policy.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <FileIcon sourceType={policy.source_type} size={32} />
                    </div>
                )}

                {/* hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/20">
                        Preview ↗
                    </span>
                </div>

                {/* file type badge */}
                <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest ${fileTypeColor(policy.source_type)}`}>
                    {fileTypeLabel(policy.source_type)}
                </span>
            </div>

            {/* body */}
            <div className="p-4 flex flex-col gap-3">
                <div>
                    <p className="text-slate-200 font-semibold text-[13px] truncate">{policy.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                            {policy.uploaded_by?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-slate-500 text-[11px] truncate">
                            {policy.uploaded_by} · {fmtDate(policy.created_at)}
                        </span>
                    </div>
                </div>

                {/* actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    {/* toggle */}
                    <button
                        onClick={onToggle}
                        disabled={toggling}
                        className="flex items-center gap-2 group/toggle"
                        title={policy.active ? "Deactivate" : "Activate"}
                    >
                        <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 flex-shrink-0
              ${policy.active ? "bg-indigo-500" : "bg-slate-700"}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200
                ${policy.active ? "translate-x-4" : "translate-x-0"}`}
                            />
                            {toggling && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-2.5 h-2.5 border border-white/40 border-t-white rounded-full animate-spin" />
                                </span>
                            )}
                        </div>
                        <span className={`text-[11px] font-semibold transition-colors
              ${policy.active ? "text-indigo-400" : "text-slate-500"}`}>
                            {policy.active ? "Active" : "Inactive"}
                        </span>
                    </button>

                    <div className="flex gap-1.5">
                        <button
                            onClick={onView}
                            className="text-[11.5px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/[0.14] transition-all font-medium"
                        >
                            View
                        </button>
                        <button
                            onClick={onDelete}
                            className="text-[11.5px] px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function UploadPolicy() {
    const { user } = useAuthStore();
    const fileInputRef = useRef();

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [policyName, setPolicyName] = useState("");
    const [activeTab, setActiveTab] = useState("active");
    const [togglingId, setTogglingId] = useState(null);

    /* ── fetch ── */
    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/policies/`, { headers: { accept: "application/json" } });
            const data = await res.json();
            setPolicies(data.policies || []);
        } catch {
            setError("Failed to load policies.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPolicies(); }, []);

    /* ── upload ── */
    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        const adminId = user?._id;
        const formData = new FormData();
        formData.append("file", selectedFile);
        const params = new URLSearchParams({ admin_id: adminId });
        if (policyName.trim()) params.append("policyName", policyName.trim());
        try {
            const res = await fetch(`${API_BASE}/policies/?${params}`, { method: "POST", body: formData });
            if (!res.ok) throw new Error();
            toast.success("Policy uploaded successfully!");
            setSelectedFile(null);
            setPolicyName("");
            setShowUploadModal(false);
            fetchPolicies();
        } catch {
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    /* ── delete ── */
    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/policies/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Policy deleted.");
            setPolicies((prev) => prev.filter((p) => p._id !== id));
        } catch {
            toast.error("Delete failed.");
        } finally {
            setDeleteTarget(null);
        }
    };

    /* ── toggle ── */
    const handleToggle = async (policy) => {
        setTogglingId(policy._id);
        try {
            const res = await fetch(`${API_BASE}/policies/toggle/${policy._id}`, { method: "GET" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPolicies((prev) =>
                prev.map((p) => p._id === policy._id ? { ...p, active: data.active } : p)
            );
            toast.success(`Policy ${data.active ? "activated" : "deactivated"}.`);
        } catch {
            toast.error("Failed to toggle policy status.");
        } finally {
            setTogglingId(null);
        }
    };

    const activePolicies = policies.filter((p) => p.active);
    const inactivePolicies = policies.filter((p) => !p.active);
    const displayed = activeTab === "active" ? activePolicies : inactivePolicies;

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 gap-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-[3px] w-7 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                        <span className="text-slate-500 text-[10.5px] tracking-[1.5px] uppercase font-semibold">Compliance</span>
                    </div>
                    <h1 className="text-[22px] font-bold text-slate-100 tracking-tight">Policy Vault</h1>
                    <p className="text-slate-500 text-[13px] mt-0.5">Manage and enforce company compliance policies</p>
                </div>

                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold transition-all border border-indigo-400/30 shadow-lg shadow-indigo-500/20"
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Policy
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Policies", value: policies.length, color: "text-slate-200" },
                    { label: "Active", value: activePolicies.length, color: "text-indigo-400" },
                    { label: "Inactive", value: inactivePolicies.length, color: "text-slate-400" },
                    { label: "PDFs", value: policies.filter(p => p.source_type?.includes("pdf")).length, color: "text-red-400" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3">
                        <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wide mb-1">{label}</p>
                        <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* ── Tab nav ── */}
            <div className="flex items-center gap-0.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
                {[
                    { key: "active", label: "Active", count: activePolicies.length },
                    { key: "inactive", label: "Inactive", count: inactivePolicies.length },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all
              ${activeTab === tab.key
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "text-slate-500 hover:text-slate-300"}`}
                    >
                        {tab.label}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
              ${activeTab === tab.key ? "bg-indigo-500/30 text-indigo-300" : "bg-white/[0.06] text-slate-500"}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Grid ── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-60 rounded-2xl bg-white/[0.04] animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <svg width="24" height="24" fill="none" stroke="#f87171" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <p className="text-slate-400 text-[14px] font-medium">{error}</p>
                </div>
            ) : displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                        <svg width="28" height="28" fill="none" stroke="#475569" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-400 text-[14px] font-medium">No {activeTab} policies</p>
                        <p className="text-slate-600 text-[12px] mt-1">
                            {activeTab === "active" ? "Upload a policy to get started." : "Deactivated policies appear here."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayed.map((policy) => (
                        <PolicyCard
                            key={policy._id}
                            policy={policy}
                            onView={() => setViewTarget(policy)}
                            onDelete={() => setDeleteTarget(policy)}
                            onToggle={() => handleToggle(policy)}
                            toggling={togglingId === policy._id}
                        />
                    ))}
                </div>
            )}

            {/* ══ UPLOAD MODAL ══ */}
            {showUploadModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={(e) => e.target === e.currentTarget && setShowUploadModal(false)}
                >
                    <div className="bg-slate-900 border border-white/[0.09] rounded-2xl shadow-2xl w-full max-w-md p-7">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-[17px] font-bold text-slate-100">Upload Policy</h2>
                                <p className="text-slate-500 text-[12px] mt-0.5">Add a new document to the vault</p>
                            </div>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 transition-colors"
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* name input */}
                        <div className="mb-4">
                            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                                Policy Name
                            </label>
                            <input
                                value={policyName}
                                onChange={(e) => setPolicyName(e.target.value)}
                                placeholder="e.g. Data Privacy Policy 2025"
                                className="w-full bg-slate-800 border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                            />
                        </div>

                        {/* file drop zone */}
                        {selectedFile ? (
                            <div className="flex items-center gap-3 bg-slate-800 border border-white/[0.08] rounded-xl px-4 py-3 mb-6">
                                <FileIcon sourceType={selectedFile.type} size={20} />
                                <span className="flex-1 text-[13px] text-slate-300 truncate">{selectedFile.name}</span>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setSelectedFile(f); }}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-6
                  ${dragOver
                                        ? "border-indigo-400 bg-indigo-500/[0.08]"
                                        : "border-white/[0.09] hover:border-indigo-500/50 hover:bg-indigo-500/[0.04]"}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all ${dragOver ? "bg-indigo-500/20 scale-110" : "bg-white/[0.05]"}`}>
                                    <svg width="22" height="22" fill="none" stroke={dragOver ? "#818cf8" : "#64748b"} strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="text-slate-300 font-semibold text-[13px] mb-1">
                                    {dragOver ? "Drop it here" : "Drop your file or click to browse"}
                                </p>
                                <p className="text-slate-600 text-[11.5px]">PDF · DOCX · JPG · PNG · TXT</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,image/*"
                                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
                                className="flex-1 py-2.5 border border-white/[0.08] rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-white/[0.04] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="flex-[2] py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                            >
                                {uploading ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading…</>
                                ) : "Upload Policy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ VIEW MODAL ══ */}
            {viewTarget && (
                <div
                    className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && setViewTarget(null)}
                >
                    <div className="bg-slate-900 border border-white/[0.09] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <FileIcon sourceType={viewTarget.source_type} size={22} />
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-200 text-[13px] truncate">{viewTarget.name}</p>
                                    <p className="text-slate-500 text-[11px] mt-0.5">{fmtDate(viewTarget.created_at)} · {viewTarget.uploaded_by}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <a
                                    href={viewTarget.file_path}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-[11.5px] px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 transition-all font-medium"
                                >
                                    Open ↗
                                </a>
                                <button
                                    onClick={() => setViewTarget(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 transition-colors"
                                >
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* body */}
                        <div className="flex-1 overflow-auto bg-slate-800/40 flex items-center justify-center p-6 min-h-64">
                            {isImage(viewTarget.source_type) ? (
                                <img
                                    src={viewTarget.file_path}
                                    alt={viewTarget.name}
                                    className="max-w-full max-h-full object-contain rounded-xl shadow-xl"
                                />
                            ) : viewTarget.source_type?.includes("pdf") ? (
                                <iframe
                                    src={viewTarget.file_path}
                                    title={viewTarget.name}
                                    className="w-full rounded-xl border border-white/[0.07]"
                                    style={{ height: "60vh" }}
                                />
                            ) : (
                                <div className="text-center py-10">
                                    <FileIcon sourceType={viewTarget.source_type} size={48} />
                                    <p className="text-slate-300 font-medium text-[13px] mt-4">{viewTarget.name}</p>
                                    <p className="text-slate-500 text-[11.5px] mt-1 mb-6">Preview not available for this file type</p>
                                    <a
                                        href={viewTarget.file_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        Download / Open ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ DELETE CONFIRM ══ */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
                >
                    <div className="bg-slate-900 border border-white/[0.09] rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                            <svg width="24" height="24" fill="none" stroke="#f87171" strokeWidth="1.5" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                            </svg>
                        </div>
                        <h2 className="text-[17px] font-bold text-slate-100 mb-2">Delete Policy?</h2>
                        <p className="text-slate-400 text-[13px] leading-relaxed mb-7">
                            <span className="font-semibold text-slate-200">{deleteTarget.name}</span> will be permanently removed. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 border border-white/[0.08] rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-white/[0.04] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTarget._id)}
                                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-[13px] font-semibold rounded-xl transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}