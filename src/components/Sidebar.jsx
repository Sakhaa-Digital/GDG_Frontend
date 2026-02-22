import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authstore.js";
import { useNavigate } from "react-router-dom";
const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/policy-vault",
    label: "policy Vault",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    to: "/scan-now",
    label: "Scan Now",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
    ),
  },
  {
    to: "/config",
    label: "Configuration",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
    ),
  },
  // {
  //   to: "/upload-scan",
  //   label: "Upload and Scan Data",
  //   icon: (
  //     <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
  //       <path d="M3 7V5a2 2 0 0 1 2-2h2" />
  //       <path d="M17 3h2a2 2 0 0 1 2 2v2" />
  //       <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
  //       <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
  //       <rect x="7" y="7" width="10" height="10" rx="1" />
  //     </svg>
  //   ),
  // },
];

export default function Sidebar() {
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const navigate=useNavigate()
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  const isAdmin = user?.role === "admin";
  const navigateToProfile = () => {
    navigate("/profile")
    // toast.success("noew")
  }
  return (
    <div className="relative flex flex-col w-60 min-w-[240px] h-screen bg-slate-950 border-r border-white/[0.06] overflow-hidden">

      {/* Gradient accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 flex-shrink-0" />

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-[22px] pb-4 border-b border-white/[0.06]">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="text-slate-100 font-bold text-[15px] tracking-tight">
          SmartPolicy
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col px-3 pt-5 gap-0.5">
        <p className="text-slate-500 text-[10px] font-semibold tracking-[1.2px] uppercase mb-2 pl-2">
          Navigation
        </p>
        {navItems.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13.5px] font-medium transition-all duration-150 no-underline
                ${active
                  ? "bg-indigo-500/[0.18] text-indigo-300 border-l-[3px] border-indigo-400"
                  : "text-slate-400 border-l-[3px] border-transparent hover:bg-white/[0.04] hover:text-slate-300"
                }`}
            >
              <span className={active ? "opacity-100" : "opacity-70"}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Profile Card */}
      {user && (
        <div className="m-3 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 cursor-pointer"
        onClick={navigateToProfile}>
          {/* Top: Avatar + Name + Role */}
          <div className="flex items-center gap-2.5 mb-2.5">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-[38px] h-[38px] rounded-full border-2 border-indigo-500/50 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
                {user.name?.charAt(0) ?? "U"}
              </div>
            )}

            <div className="flex flex-col gap-1 overflow-hidden">
              <p className="text-slate-200 font-semibold text-[13px] truncate m-0">
                {user.name ?? "Unknown"}
              </p>
              <span
                className={`text-[10px] font-semibold tracking-[0.6px] uppercase border rounded px-1.5 py-px w-fit
                  ${isAdmin
                    ? "text-amber-400 border-amber-400"
                    : "text-emerald-300 border-emerald-300"
                  }`}
              >
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Email */}
          {/* <p className="text-slate-500 text-[11px] truncate m-0">{user.email}</p> */}

          {/* Divider */}
          <div className="h-px bg-white/[0.07] my-3" />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-red-500/25 bg-red-500/[0.07] text-red-400 text-[12.5px] font-semibold cursor-pointer transition-all duration-150 hover:bg-red-500/[0.15] hover:border-red-500/40"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}