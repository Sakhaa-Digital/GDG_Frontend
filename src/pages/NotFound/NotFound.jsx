import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFoundIllustration = () => (
    <svg viewBox="0 0 460 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg mx-auto">
        {/* Ambient glows */}
        <ellipse cx="230" cy="150" rx="200" ry="130" fill="url(#glow1)" opacity="0.13" />
        <ellipse cx="100" cy="80" rx="80" ry="60" fill="url(#glow2)" opacity="0.1" />
        <ellipse cx="360" cy="220" rx="70" ry="50" fill="url(#glow3)" opacity="0.1" />

        {/* Background document (blurred / ghost) */}
        <rect x="30" y="60" width="130" height="170" rx="12" fill="rgba(30,41,59,0.6)" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
        {[88, 106, 124, 142, 160, 178, 196].map((y, i) => (
            <rect key={i} x="50" y={y} width={i % 2 === 0 ? 80 : 55} height="7" rx="3.5" fill="rgba(165,180,252,0.07)" />
        ))}

        {/* Main center document */}
        <rect x="155" y="30" width="150" height="200" rx="14" fill="url(#mainDoc)" stroke="rgba(99,102,241,0.3)" strokeWidth="1.2" />

        {/* Document header bar */}
        <rect x="155" y="30" width="150" height="28" rx="14" fill="url(#docHeader)" />
        <rect x="155" y="44" width="150" height="14" fill="url(#docHeader)" />
        <circle cx="175" cy="44" r="5" fill="rgba(239,68,68,0.7)" />
        <circle cx="192" cy="44" r="5" fill="rgba(251,191,36,0.6)" />
        <circle cx="209" cy="44" r="5" fill="rgba(52,211,153,0.5)" />

        {/* Doc lines */}
        {[78, 96, 114, 132].map((y, i) => (
            <rect key={i} x="175" y={y} width={i % 2 === 0 ? 110 : 75} height="7" rx="3.5" fill="rgba(165,180,252,0.18)" />
        ))}

        {/* Violation highlight row */}
        <rect x="168" y="150" width="124" height="28" rx="7" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.4)" strokeWidth="1" />
        <circle cx="183" cy="164" r="6" fill="rgba(239,68,68,0.8)" />
        <text x="178" y="168" fill="white" fontSize="8" fontWeight="bold">!</text>
        <rect x="196" y="160" width="80" height="5" rx="2.5" fill="rgba(239,68,68,0.45)" />
        <rect x="196" y="168" width="55" height="4" rx="2" fill="rgba(239,68,68,0.25)" />

        {/* More lines below */}
        {[192, 210, 225].map((y, i) => (
            <rect key={i} x="175" y={y} width={i % 2 === 0 ? 95 : 70} height="6" rx="3" fill="rgba(165,180,252,0.1)" />
        ))}

        {/* Scan line */}
        <rect x="155" y="164" width="150" height="2" fill="url(#scanLine)" opacity="0.65" />

        {/* Right floating card */}
        <rect x="310" y="70" width="110" height="85" rx="12" fill="rgba(15,23,42,0.85)" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
        <rect x="325" y="88" width="80" height="6" rx="3" fill="rgba(103,232,249,0.25)" />
        <rect x="325" y="100" width="55" height="5" rx="2.5" fill="rgba(103,232,249,0.15)" />
        {/* Mini bar chart */}
        {[22, 14, 30, 18, 26, 10].map((h, i) => (
            <rect key={i} x={325 + i * 13} y={148 - h} width="9" height={h} rx="3" fill={`rgba(99,102,241,${0.25 + i * 0.06})`} />
        ))}

        {/* Big 404 ghost numbers */}
        <text x="50" y="285" fill="url(#textGrad)" fontSize="72" fontWeight="900" opacity="0.07" letterSpacing="-4">404</text>

        {/* Shield with X — top right of main doc */}
        <circle cx="350" cy="52" r="22" fill="url(#shieldBg)" opacity="0.9" />
        <path d="M350 62s6-3 6-7.5V49l-6-2.25L344 49v5.5c0 4.5 6 7.5 6 7.5z" fill="white" opacity="0.85" />
        <line x1="345" y1="51" x2="355" y2="61" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="355" y1="51" x2="345" y2="61" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />

        {/* Floating dots */}
        <circle cx="45" cy="250" r="5" fill="rgba(99,102,241,0.35)" />
        <circle cx="415" cy="100" r="4" fill="rgba(139,92,246,0.3)" />
        <circle cx="400" cy="260" r="6" fill="rgba(6,182,212,0.2)" />
        <circle cx="140" cy="270" r="3" fill="rgba(99,102,241,0.3)" />

        <defs>
            <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mainDoc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="docHeader" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="shieldBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="scanLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="textGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
    </svg>
);

export default function NotFound() {
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((d) => (d.length >= 3 ? "" : d + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-950 overflow-hidden px-6 py-12">

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

            {/* Background glow blobs */}
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[
                    { top: "15%", left: "8%", size: 3, color: "bg-indigo-500/40", delay: "0s" },
                    { top: "70%", left: "5%", size: 4, color: "bg-purple-500/30", delay: "1s" },
                    { top: "30%", left: "92%", size: 3, color: "bg-cyan-500/40", delay: "0.5s" },
                    { top: "80%", left: "88%", size: 5, color: "bg-indigo-400/25", delay: "1.5s" },
                    { top: "55%", left: "15%", size: 2, color: "bg-purple-400/35", delay: "2s" },
                    { top: "20%", left: "75%", size: 4, color: "bg-indigo-500/30", delay: "0.8s" },
                    { top: "90%", left: "40%", size: 3, color: "bg-cyan-400/25", delay: "1.2s" },
                    { top: "10%", left: "50%", size: 2, color: "bg-purple-500/30", delay: "0.3s" },
                ].map((p, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full ${p.color} animate-pulse`}
                        style={{
                            width: p.size,
                            height: p.size,
                            top: p.top,
                            left: p.left,
                            animationDelay: p.delay,
                            animationDuration: "2.5s",
                        }}
                    />
                ))}
            </div>

            {/* Brand */}
            <div className="relative flex items-center gap-3 mb-10">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <span className="text-slate-100 font-bold text-lg tracking-tight">SmartPolicy</span>
            </div>

            {/* Illustration */}
            <div className="relative w-full max-w-lg mb-6">
                <NotFoundIllustration />
            </div>

            {/* 404 badge */}
            <div className="relative flex items-center gap-2 mb-5">
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-1 rounded-full">
                    Error 404
                </span>
                <span className="text-[10px] font-semibold tracking-[1.5px] uppercase text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-full">
                    Page Not Found
                </span>
            </div>

            {/* Main heading */}
            <h1 className="relative text-4xl sm:text-5xl font-black text-slate-100 tracking-tight text-center mb-4 leading-tight">
                Policy{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                    Scan Failed
                </span>
            </h1>

            {/* Subtitle */}
            <p className="relative text-slate-400 text-sm sm:text-base text-center max-w-md leading-relaxed mb-8">
                Our AI couldn't locate this page in the policy database.
                <br />
                It may have been moved, deleted, or never existed.
            </p>

            {/* Terminal-style status block */}
            <div className="relative w-full max-w-sm mb-10 bg-slate-900/80 border border-white/[0.07] rounded-xl p-4 font-mono text-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
                    <span className="ml-2 text-slate-600 text-[10px]">policy-scanner.log</span>
                </div>
                <p className="text-slate-500">
                    <span className="text-indigo-400">[SCAN]</span> Initializing policy lookup{dots}
                </p>
                <p className="text-slate-500 mt-1">
                    <span className="text-purple-400">[AI]</span> Scanning policy registry...
                </p>
                <p className="text-red-400 mt-1">
                    <span className="text-red-500">[ERROR]</span> Route not found in violation dashboard
                </p>
                <p className="text-amber-400/80 mt-1">
                    <span className="text-amber-500">[WARN]</span> Redirecting to safe zone...
                </p>
            </div>

            {/* CTA Buttons */}
            <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-10">
                <Link
                    to="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Back to Dashboard
                </Link>

                <Link
                    to="/scan-now"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-indigo-500/40 text-slate-300 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <rect x="7" y="7" width="10" height="10" rx="1" />
                    </svg>
                    Run a Scan
                </Link>

                <Link
                    to="/policy-vault"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-cyan-500/40 text-slate-300 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Policy
                </Link>
            </div>

            {/* Bottom divider */}
            <div className="relative flex items-center gap-4 w-full max-w-sm">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <p className="text-slate-600 text-[11px] text-center">
                    AI-Powered Policy Management
                </p>
                <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
        </div>
    );
}