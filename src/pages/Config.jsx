import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ status }) => {
    const map = {
        processing: { label: 'Processing', cls: 'text-amber-400 border-amber-400/40 bg-amber-400/[0.08]' },
        completed: { label: 'Completed', cls: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/[0.08]' },
        failed: { label: 'Failed', cls: 'text-red-400 border-red-400/40 bg-red-400/[0.08]' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'text-slate-400 border-slate-400/30 bg-slate-400/[0.06]' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border ${cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'processing' ? 'bg-amber-400 animate-pulse' : status === 'completed' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {label}
        </span>
    );
};

const Config = () => {
    const navigate = useNavigate();
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [toast, setToast] = useState(null);
    const [adminId] = useState('admin123');
    const fileRef = useRef();

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchDatasets = async () => {
        try {
            const res = await fetch(`${API_BASE}/dataset/`);
            const data = await res.json();
            setDatasets(data.datasets || []);
        } catch {
            showToast('Failed to fetch datasets', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDatasets(); }, []);

    const handleUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await fetch(`${API_BASE}/dataset/?admin_id=${adminId}`, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`Dataset uploaded — ID: ${data.dataset_id}`, 'success');
                fetchDatasets();
            } else {
                showToast('Upload failed', 'error');
            }
        } catch {
            showToast('Upload error — check server', 'error');
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl transition-all
          ${toast.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                    {toast.type === 'success'
                        ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                        : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
                    {toast.msg}
                </div>
            )}

            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-[3px] w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                            <span className="text-slate-500 text-[11px] tracking-[1.5px] uppercase font-semibold">Configuration</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Dataset Management</h1>
                        <p className="text-slate-500 text-sm mt-1">Upload and manage policy datasets for violation analysis</p>
                    </div>

                    {/* Scan Datasets Now CTA */}
                    <button
                        onClick={() => navigate('/scan-now')}
                        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-[13px] font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 border border-indigo-400/30"
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Scan Datasets Now
                    </button>
                </div>

                {/* Upload Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={onDrop}
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`relative mb-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
            ${dragActive
                            ? 'border-indigo-400 bg-indigo-500/[0.08]'
                            : 'border-white/[0.1] bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/[0.04]'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />

                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center relative z-10">
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin mb-4" />
                                <p className="text-slate-300 font-semibold text-sm">Uploading dataset…</p>
                                <p className="text-slate-500 text-xs mt-1">Please wait while we process your file</p>
                            </>
                        ) : (
                            <>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
                  ${dragActive ? 'bg-indigo-500/20 scale-110' : 'bg-white/[0.05]'}`}>
                                    <svg width="26" height="26" fill="none" stroke={dragActive ? '#818cf8' : '#64748b'} strokeWidth="1.8" viewBox="0 0 24 24">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                </div>
                                <p className="text-slate-200 font-semibold text-sm mb-1">
                                    {dragActive ? 'Drop your file here' : 'Upload a Dataset'}
                                </p>
                                <p className="text-slate-500 text-xs">Drag & drop or <span className="text-indigo-400 font-medium">click to browse</span> · CSV files supported</p>
                            </>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
                </div>

                {/* Table Card */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                    {/* Table Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                                <svg width="14" height="14" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M3 15h18M9 3v18" />
                                </svg>
                            </div>
                            <span className="text-slate-200 font-semibold text-sm">All Datasets</span>
                            <span className="text-[11px] text-slate-500 font-medium bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full">
                                {datasets.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/scan-now')}
                                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
                            >
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                Scan Now
                            </button>
                            <button
                                onClick={fetchDatasets}
                                className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-indigo-300 transition-colors font-medium"
                            >
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.05]">
                                    {['Dataset Name', 'Status', 'Rows', 'Violations', 'Uploaded By', 'Created At', 'File'].map((h) => (
                                        <th key={h} className="text-left text-[10.5px] font-semibold text-slate-500 tracking-[0.8px] uppercase px-6 py-3.5">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i} className="border-b border-white/[0.04]">
                                            {Array.from({ length: 7 }).map((__, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-3.5 rounded-md bg-white/[0.05] animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : datasets.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                                    <svg width="22" height="22" fill="none" stroke="#475569" strokeWidth="1.5" viewBox="0 0 24 24">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                    </svg>
                                                </div>
                                                <p className="text-slate-400 font-medium text-sm">No datasets yet</p>
                                                <p className="text-slate-600 text-xs">Upload a CSV to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    datasets.map((ds, idx) => (
                                        <tr
                                            key={ds._id}
                                            className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] group
                        ${idx === datasets.length - 1 ? 'border-b-0' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                                        <svg width="13" height="13" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                            <polyline points="14 2 14 8 20 8" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-slate-200 font-medium text-[13px] truncate max-w-[180px]">{ds.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={ds.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-300 font-mono text-[13px]">
                                                    {ds.total_rows.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-mono text-[13px] font-semibold ${ds.violations_count > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {ds.violations_count.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-400 text-[12.5px] font-mono">{ds.uploaded_by}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-500 text-[12px]">{formatDate(ds.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={ds.file_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/[0.1] border border-indigo-500/25 text-indigo-300 text-[11.5px] font-medium hover:bg-indigo-500/20 transition-all no-underline"
                                                >
                                                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="7 10 12 15 17 10" />
                                                        <line x1="12" y1="15" x2="12" y2="3" />
                                                    </svg>
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {datasets.length > 0 && !loading && (
                        <div className="px-6 py-3.5 border-t border-white/[0.05] flex items-center justify-between">
                            <span className="text-slate-600 text-[11.5px]">
                                Showing {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-slate-600 text-[11.5px]">
                                {datasets.filter(d => d.status === 'completed').length} completed · {datasets.filter(d => d.status === 'processing').length} processing
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Config;