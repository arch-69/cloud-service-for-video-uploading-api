import { Bell, LogOut, Moon, Sun } from "lucide-react";

export default function Header({ user, onLogout, theme, onToggleTheme }) {
  return (
    <header className="app-header">
      <div>
        <h2>Welcome back, {user.name}</h2>
        <p className="muted">Manage uploads, monitor traffic, and stay on track.</p>
      </div>

      <div className="header-actions">
        <button className="icon-button" type="button">
          <Bell size={18} />
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="user-chip">
          <div className="avatar">
            {user.pfp ? (
              <img src={user.pfp} alt={`${user.name} avatar`} />
            ) : (
              user.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="user-name">{user.name}</p>
            <span className="user-role">{user.role}</span>
          </div>
          <button className="link-button" onClick={onLogout} type="button">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
