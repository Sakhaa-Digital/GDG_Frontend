import { useAuthStore } from "../store/authstore.js";

const InfoRow = ({ label, value, mono = false }) => (
    <div className="flex justify-between items-center px-5 py-3 border-b border-white/[0.04] last:border-0">
        <span className="text-slate-500 text-xs font-medium shrink-0 mr-3">{label}</span>
        <span className={`text-slate-300 text-xs font-medium text-right truncate max-w-[180px] ${mono ? "font-mono" : ""}`}>
            {value ?? "—"}
        </span>
    </div>
);

export default function Profile() {
    const { user } = useAuthStore();

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0b1120]">
                <p className="text-slate-500">No user data found.</p>
            </div>
        );
    }

    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    const lastUpdated = user.updatedAt
        ? new Date(user.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    const joinYear = joinedDate?.split(" ")[2] ?? "—";
    const isAdmin = user.role === "admin";
    const roleLabel = user.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "User";
    const providerLabel = user.provider
        ? user.provider.charAt(0).toUpperCase() + user.provider.slice(1)
        : null;

    return (
        <div className="min-h-screen bg-[#0b1120] px-8 py-10 relative overflow-x-hidden font-sans">
            {/* Backdrop gradient */}
            <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto relative">

                {/* Page Header */}
                <div className="mb-7">
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">My Profile</h1>
                    <p className="text-slate-500 text-sm">View and manage your account information</p>
                </div>

                {/* Hero Card */}
                <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 mb-5 overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

                    <div className="flex items-center gap-7 flex-wrap">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-[-3px] rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 opacity-70 z-0" />
                            {user.picture ? (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full object-cover relative z-10 block"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-extrabold relative z-10">
                                    {user.name?.charAt(0) ?? "U"}
                                </div>
                            )}
                            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0b1120] z-20 block" />
                        </div>

                        {/* Identity */}
                        <div className="flex-1 min-w-[180px]">
                            <h2 className="text-slate-100 text-xl font-bold tracking-tight mb-1">{user.name}</h2>
                            <p className="text-slate-500 text-sm mb-3">{user.email}</p>
                            <div className="flex gap-2 flex-wrap">
                                <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${isAdmin
                                            ? "text-amber-400 bg-amber-400/10 border-amber-400/30"
                                            : "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
                                        }`}
                                >
                                    ◈ {roleLabel}
                                </span>
                                {providerLabel && (
                                    <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full capitalize">
                                        via {providerLabel}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats Panel */}
                        <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl px-6 py-4 shrink-0 ml-auto">
                            <div className="flex flex-col items-center gap-1 px-5">
                                <span className="text-slate-200 font-bold text-sm">{joinYear}</span>
                                <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Since</span>
                            </div>
                            <div className="w-px h-8 bg-white/[0.08]" />
                            <div className="flex flex-col items-center gap-1 px-5">
                                <span className="text-slate-200 font-bold text-sm">{roleLabel}</span>
                                <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Access</span>
                            </div>
                            <div className="w-px h-8 bg-white/[0.08]" />
                            <div className="flex flex-col items-center gap-1 px-5">
                                <span className="text-green-400 font-bold text-sm">Active</span>
                                <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Status</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-5 mb-5">

                    {/* Personal Information */}
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <svg width="16" height="16" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3 className="text-slate-200 font-semibold text-sm">Personal Information</h3>
                        </div>
                        <div className="py-2">
                            <InfoRow label="Full Name" value={user.name} />
                            <InfoRow label="Email Address" value={user.email} />
                            <InfoRow label="Auth Provider" value={providerLabel} />
                            <InfoRow label="Member Since" value={joinedDate} />
                            <InfoRow label="Last Updated" value={lastUpdated} />
                        </div>
                    </div>

                    {/* Account & Security */}
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <svg width="16" height="16" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <h3 className="text-slate-200 font-semibold text-sm">Account & Security</h3>
                        </div>
                        <div className="py-2">
                            <InfoRow label="Role" value={roleLabel} />
                            <InfoRow label="User ID" value={user._id} mono />
                            <InfoRow label="Firebase UID" value={user.uid} mono />
                            <InfoRow label="Version" value={`v${user.__v ?? 0}`} />
                            <div className="flex justify-between items-center px-5 py-3">
                                <span className="text-slate-500 text-xs font-medium">Account Status</span>
                                <span className="text-green-400 text-xs font-semibold bg-green-400/10 border border-green-400/20 px-3 py-0.5 rounded-full">
                                    ● Active
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* UID Footer Card */}
                <div className="flex items-center justify-between flex-wrap gap-2 bg-indigo-500/[0.06] border border-indigo-500/20 rounded-xl px-5 py-4">
                    <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest m-0">
                        Your unique identifier
                    </p>
                    <p className="text-slate-400 text-xs font-mono tracking-wide m-0">
                        {user._id}
                    </p>
                </div>

            </div>
        </div>
    );
}