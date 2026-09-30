import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Live Feed", path: "/" },
  { label: "Alert Center", path: "/alerts" },
  { label: "Analytics", path: "/analytics" },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-slate-950 p-5">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">
          🛡️ CyberShield
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Fraud Detection System
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* System status */}
      <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-xs text-slate-300">
            System Online
          </span>
        </div>
      </div>
    </aside>
  );
}