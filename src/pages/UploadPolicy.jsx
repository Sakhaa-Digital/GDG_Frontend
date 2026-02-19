import { useState, useEffect, useRef } from "react";
import {toast} from "react-hot-toast";
const API_BASE = "http://localhost:8000";
import { useAuthStore } from "../store/authstore";
const isImage = (sourceType) => sourceType && sourceType.startsWith("image/");

const fileTypeIcon = (sourceType) => {
    if (!sourceType) return "📄";
    if (sourceType.includes("pdf")) return "📕";
    if (sourceType.includes("word") || sourceType.includes("document")) return "📘";
    if (sourceType.includes("text")) return "📝";
    return "📄";
};

const fileTypeLabel = (sourceType) => {
    if (!sourceType) return "File";
    if (sourceType.includes("pdf")) return "PDF";
    if (sourceType.includes("jpeg") || sourceType.includes("jpg")) return "JPEG";
    if (sourceType.includes("png")) return "PNG";
    if (sourceType.includes("word") || sourceType.includes("docx")) return "DOCX";
    if (sourceType.includes("text")) return "TXT";
    return sourceType.split("/")[1]?.toUpperCase() || "FILE";
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function PolicyCard({ policy, onView, onDelete, onToggle, toggling }) {
    return (
        <div className={`bg-white border rounded-2xl flex flex-col overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${policy.active ? "border-gray-200" : "border-gray-100 opacity-70"}`}>
            {/* Thumbnail */}
            <div
                className="relative w-full h-36 bg-gray-50 flex items-center justify-center cursor-pointer group overflow-hidden"
                onClick={onView}
            >
                {isImage(policy.source_type) ? (
                    <img
                        src={policy.file_path}
                        alt={policy.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <span className="text-5xl select-none">{fileTypeIcon(policy.source_type)}</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md">
                        👁 Preview
                    </span>
                </div>
                <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 bg-white/90 text-gray-600 border border-gray-200 rounded-md uppercase tracking-wide shadow-sm">
                    {fileTypeLabel(policy.source_type)}
                </span>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3">
                <div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{policy.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {policy.uploaded_by?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-xs text-gray-400">{policy.uploaded_by} · {formatDate(policy.created_at)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {/* Toggle */}
                    <button
                        onClick={onToggle}
                        disabled={toggling}
                        className="flex items-center gap-2 group"
                        title={policy.active ? "Click to deactivate" : "Click to activate"}
                    >
                        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${policy.active ? "bg-emerald-500" : "bg-gray-300"}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${policy.active ? "translate-x-4" : "translate-x-0"}`} />
                            {toggling && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                </span>
                            )}
                        </div>
                        <span className={`text-xs font-semibold transition-colors ${policy.active ? "text-emerald-600" : "text-gray-400"}`}>
                            {policy.active ? "Active" : "Inactive"}
                        </span>
                    </button>

                    <div className="flex gap-1.5">
                        <button
                            onClick={onView}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors font-medium"
                        >
                            View
                        </button>
                        <button
                            onClick={onDelete}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UploadPolicy() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    // const [adminId, setAdminId] = useState("admin123");
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState("active");
    const [togglingId, setTogglingId] = useState(null);
    const fileInputRef = useRef(null);
    const { user } = useAuthStore()


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

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const adminId=user?._id
        try {
            const res = await fetch(`${API_BASE}/policies/?admin_id=${encodeURIComponent(adminId)}`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error();
            toast.success("Policy uploaded successfully!");
            
            setSelectedFile(null);
            setShowModal(false);
            fetchPolicies();
        } catch {
            toast.error("Upload failed. Please try again.", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/policies/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Policy deleted.");
            setPolicies((prev) => prev.filter((p) => p._id !== id));
        } catch {
            toast.error("Delete failed.", "error");
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleToggleActive = async (policy) => {
        setTogglingId(policy._id);
        try {
            const res = await fetch(`${API_BASE}/policies/toggle/${policy._id}`, { method: "GET" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            console.log("data",data)
            const newActive = data.active;
            setPolicies((prev) =>
                prev.map((p) => p._id === policy._id ? { ...p, active: newActive } : p)
            );
            toast.success(`Policy marked as ${newActive ? "active" : "inactive"}.`)
        } catch {
            toast.error("Failed to toggle policy status.")

        } finally {
            setTogglingId(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setSelectedFile(file);
    };

    const activePolicies = policies.filter((p) => p.active);
    const inactivePolicies = policies.filter((p) => !p.active);
    const displayed = activeTab === "active" ? activePolicies : inactivePolicies;

    return (
        <div className="w-full">
            {/* HEADER */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Policy Vault</h1>
                    <p className="mt-1 text-sm text-gray-400">Manage and distribute company policies</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                    <span className="text-base leading-none">+</span> Add Policy
                </button>
            </div>

            {/* TAB NAV */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                {[
                    { key: "active", label: "Active", count: activePolicies.length, activeColor: "text-violet-600", countColor: "bg-violet-100 text-violet-600" },
                    { key: "inactive", label: "Inactive", count: inactivePolicies.length, activeColor: "text-gray-700", countColor: "bg-gray-200 text-gray-600" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key
                                ? `bg-white ${tab.activeColor} shadow-sm`
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab.key ? tab.countColor : "bg-gray-200 text-gray-500"
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* GRID */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-52 rounded-2xl bg-gray-100 animate-pulse" />)}
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-500">Connection Error</h3>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                </div>
            ) : displayed.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4 opacity-30">{activeTab === "active" ? "📋" : "🗂️"}</div>
                    <h3 className="text-lg font-semibold text-gray-500">No {activeTab} policies</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {activeTab === "active" ? "Upload a policy to get started." : "Deactivated policies will appear here."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayed.map((policy) => (
                        <PolicyCard
                            key={policy._id}
                            policy={policy}
                            onView={() => setViewTarget(policy)}
                            onDelete={() => setDeleteTarget(policy)}
                            onToggle={() => handleToggleActive(policy)}
                            toggling={togglingId === policy._id}
                        />
                    ))}
                </div>
            )}

            {/* ── VIEW MODAL ── */}
            {viewTarget && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.target === e.currentTarget && setViewTarget(null)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xl flex-shrink-0">
                                    {isImage(viewTarget.source_type) ? "🖼️" : fileTypeIcon(viewTarget.source_type)}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">{viewTarget.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(viewTarget.created_at)} · {viewTarget.uploaded_by}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                <a
                                    href={viewTarget.file_path}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Open ↗
                                </a>
                                <button
                                    onClick={() => setViewTarget(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        {/* Modal body */}
                        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-6 min-h-64">
                            {isImage(viewTarget.source_type) ? (
                                <img
                                    src={viewTarget.file_path}
                                    alt={viewTarget.name}
                                    className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                                />
                            ) : viewTarget.source_type?.includes("pdf") ? (
                                <iframe
                                    src={viewTarget.file_path}
                                    title={viewTarget.name}
                                    className="w-full rounded-xl border border-gray-200"
                                    style={{ height: "60vh" }}
                                />
                            ) : (
                                <div className="text-center py-10">
                                    <div className="text-6xl mb-4">{fileTypeIcon(viewTarget.source_type)}</div>
                                    <p className="text-gray-600 font-medium text-sm">{viewTarget.name}</p>
                                    <p className="text-gray-400 text-xs mt-2 mb-6">Preview not available for this file type</p>
                                    <a
                                        href={viewTarget.file_path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
                                    >
                                        Download / Open ↗
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── UPLOAD MODAL ── */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">Upload Policy</h2>
                        <p className="text-sm text-gray-400 mb-6">Add a new document to the company vault</p>

                        {/* <div className="mb-5">
                            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Admin ID</label>
                            <input
                                value={adminId}
                                onChange={(e) => setAdminId(e.target.value)}
                                placeholder="Enter admin ID"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                            />
                        </div> */}

                        {selectedFile ? (
                            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
                                <span className="text-xl">{fileTypeIcon(selectedFile.type)}</span>
                                <span className="flex-1 text-sm text-gray-700 truncate">{selectedFile.name}</span>
                                <button onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors">✕</button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-6
                                    ${dragOver ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-violet-300 hover:bg-gray-50"}`}
                            >
                                <div className="text-3xl mb-2">📁</div>
                                <p className="text-sm font-semibold text-gray-600">Drop your file here or click to browse</p>
                                <p className="text-xs text-gray-400 mt-1">Drag & drop or click to select</p>
                                <p className="text-xs text-violet-400 mt-2">PDF · DOCX · JPG · PNG · TXT · and more</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                                />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowModal(false); setSelectedFile(null); }}
                                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="flex-[2] py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                                {uploading ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Uploading…</>
                                ) : "Upload Policy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM ── */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
                        <div className="text-5xl mb-4">🗑️</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Policy?</h2>
                        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                            <span className="font-semibold text-gray-600">{deleteTarget.name}</span> will be permanently removed. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteTarget._id)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

    
        </div>
    );
}