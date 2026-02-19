import React, { useEffect } from "react";
import { auth, provider } from "./firebase.js";
import { signInWithPopup } from "firebase/auth";
import { Toaster, toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authstore.js";
import { useNavigate } from "react-router-dom";

const ShieldIcon = () => (
    <svg width="48" height="48" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PolicyIllustration = () => (
    <svg viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
        {/* Glow blobs */}
        <ellipse cx="210" cy="170" rx="180" ry="130" fill="url(#blob1)" opacity="0.18" />
        <ellipse cx="310" cy="80" rx="80" ry="60" fill="url(#blob2)" opacity="0.13" />

        {/* Main document card */}
        <rect x="80" y="60" width="200" height="240" rx="16" fill="url(#card1)" />
        <rect x="80" y="60" width="200" height="240" rx="16" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />

        {/* Document lines */}
        {[100, 120, 140, 160, 180].map((y, i) => (
            <rect key={i} x="108" y={y} width={i % 2 === 0 ? 120 : 80} height="8" rx="4" fill="rgba(165,180,252,0.25)" />
        ))}

        {/* Highlight line */}
        <rect x="108" y="200" width="144" height="8" rx="4" fill="rgba(99,102,241,0.5)" />
        <rect x="108" y="216" width="100" height="8" rx="4" fill="rgba(165,180,252,0.2)" />
        <rect x="108" y="232" width="120" height="8" rx="4" fill="rgba(165,180,252,0.15)" />

        {/* Shield badge on document */}
        <circle cx="180" cy="88" r="18" fill="url(#shieldGrad)" />
        <path d="M180 96s6-3 6-7.5V85l-6-2.25L174 85v3.5c0 4.5 6 7.5 6 7.5z" fill="white" opacity="0.9" />

        {/* Floating card 1 - top right */}
        <rect x="270" y="50" width="110" height="70" rx="12" fill="url(#card2)" />
        <rect x="270" y="50" width="110" height="70" rx="12" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        <circle cx="292" cy="75" r="10" fill="rgba(99,102,241,0.4)" />
        <rect x="310" y="68" width="55" height="7" rx="3.5" fill="rgba(165,180,252,0.3)" />
        <rect x="310" y="80" width="40" height="6" rx="3" fill="rgba(165,180,252,0.2)" />
        <rect x="284" y="95" width="82" height="6" rx="3" fill="rgba(165,180,252,0.15)" />
        <rect x="284" y="107" width="60" height="6" rx="3" fill="rgba(165,180,252,0.1)" />

        {/* Floating card 2 - bottom right */}
        <rect x="285" y="180" width="100" height="80" rx="12" fill="url(#card3)" />
        <rect x="285" y="180" width="100" height="80" rx="12" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
        <rect x="300" y="198" width="70" height="6" rx="3" fill="rgba(103,232,249,0.3)" />
        <rect x="300" y="210" width="55" height="6" rx="3" fill="rgba(103,232,249,0.2)" />
        {/* Mini bar chart */}
        {[28, 18, 34, 22, 30].map((h, i) => (
            <rect key={i} x={300 + i * 14} y={252 - h} width="9" height={h} rx="3" fill={`rgba(99,102,241,${0.3 + i * 0.07})`} />
        ))}

        {/* Scan line effect */}
        <rect x="80" y="190" width="200" height="2" fill="url(#scanLine)" opacity="0.6" />

        {/* Floating dots */}
        <circle cx="60" cy="120" r="5" fill="rgba(99,102,241,0.4)" />
        <circle cx="55" cy="200" r="3" fill="rgba(139,92,246,0.3)" />
        <circle cx="390" cy="150" r="4" fill="rgba(6,182,212,0.35)" />
        <circle cx="380" cy="250" r="6" fill="rgba(99,102,241,0.2)" />
        <circle cx="240" cy="310" r="4" fill="rgba(139,92,246,0.25)" />

        <defs>
            <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="card1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="card2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="card3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#164e63" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="scanLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
        </defs>
    </svg>
);

const GoogleLoginPage = () => {
    const navigate = useNavigate();
    const { user, continuewithGoogle } = useAuthStore();

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            const data = await continuewithGoogle(token);
            if (data && data.user) {
                console.log("Logged in user:", data.user);
            }
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("Login failed, please try again");
        }
    };

    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    return (
        <div className="flex min-h-screen bg-slate-950 overflow-hidden">
            <Toaster
                toastOptions={{
                    style: { background: "#1e293b", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.08)" },
                }}
            />

            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 px-16 py-12 relative">
                {/* Background glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/5 blur-2xl" />
                </div>

                {/* Brand */}
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <span className="text-slate-100 font-bold text-xl tracking-tight">SmartPolicy</span>
                </div>

                {/* Illustration + tagline */}
                <div className="relative flex flex-col items-center gap-8">
                    <PolicyIllustration />

                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
                            Policy compliance,{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                simplified.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                            Upload, scan, and manage your organization's policies — all in one intelligent platform.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {["AI-Powered Scanning", "Instant Reports", "Role-Based Access"].map((f) => (
                            <span
                                key={f}
                                className="text-xs font-medium text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-full"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer note */}
                <p className="relative text-slate-600 text-xs text-center">
                    © {new Date().getFullYear()} SmartPolicy. All rights reserved.
                </p>
            </div>

            {/* ── Divider ── */}
            <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />

            {/* ── Right Panel — Login Form ── */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12 relative">
                {/* Subtle glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

                <div className="relative w-full max-w-sm space-y-8">

                    {/* Mobile brand (visible only on small screens) */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <span className="text-slate-100 font-bold text-lg">SmartPolicy</span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Sign in to access your policy dashboard and start scanning.
                        </p>
                    </div>

                    {/* Shield trust badge */}
                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-slate-300 text-xs font-semibold">Secure Authentication</p>
                            <p className="text-slate-500 text-[11px]">Protected by Google OAuth 2.0</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/[0.07]" />
                        <span className="text-slate-600 text-xs">Continue with</span>
                        <div className="flex-1 h-px bg-white/[0.07]" />
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="group relative flex items-center justify-center gap-3 w-full py-3.5 px-5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-indigo-500/40 text-slate-200 text-sm font-semibold transition-all duration-200 shadow-lg shadow-black/20"
                    >
                        {/* Subtle gradient shimmer on hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <img
                            src="https://developers.google.com/identity/images/g-logo.png"
                            alt="Google Logo"
                            className="w-5 h-5 flex-shrink-0 relative"
                        />
                        <span className="relative">Continue with Google</span>
                    </button>

                    {/* Terms note */}
                    <p className="text-slate-600 text-[11px] text-center leading-relaxed">
                        By signing in, you agree to our{" "}
                        <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">Terms of Service</span>{" "}
                        and{" "}
                        <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GoogleLoginPage;