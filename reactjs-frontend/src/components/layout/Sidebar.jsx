import {
  Cloud,
  UploadCloud,
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Settings,
  ArrowLeft,
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
  const isVideoRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/video/');
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
                  onClick={() => {
                    // map view id to a friendly path and push history so back/forward works
                    const pathMap = {
                      dashboard: '/',
                      uploads: '/uploads',
                      activity: '/activity',
                      admin: '/admin',
                      settings: '/settings',
                    };
                    const path = pathMap[item.id] || '/';
                    window.history.pushState({}, '', path);
                    // notify SPA routing
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    onNavigate(item.id);
                  }}
                >
                <Icon size={18} />
                <span>
                  {item.label}
                  {item.id === 'dashboard' && isVideoRoute && (
                    <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center' }}>
                      <ArrowLeft size={14} />
                    </span>
                  )}
                </span>
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
