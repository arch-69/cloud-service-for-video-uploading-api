import {
  Cloud,
  UploadCloud,
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Settings,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "uploads", label: "Uploads", icon: UploadCloud },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  activeView,
  onNavigate,
  role,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand-icon">
          <Cloud size={22} />
        </div>
        <div>
          <p className="brand-title">CloudDock</p>
          <span className="brand-subtitle">Upload Suite</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems
          .filter((item) => !item.adminOnly || role === "admin")
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
      </nav>

      <div className="sidebar__footer">
        <div className="status-pill">
          <span className="dot dot--success" />
          Live status
        </div>
        <p className="footnote">Secure • Fast • Reliable</p>
      </div>
    </aside>
  );
}
