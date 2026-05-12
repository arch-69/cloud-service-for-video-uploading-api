export default function SettingsPanel({ user }) {
  return (
    <div className="card settings-panel">
      <h3>Workspace settings</h3>
      <div className="settings-grid">
        <div>
          <p className="muted small">Account</p>
          <strong>{user.email}</strong>
        </div>
        <div>
          <p className="muted small">Role</p>
          <strong>{user.role}</strong>
        </div>
        <div>
          <p className="muted small">Security</p>
          <strong>2FA enforced</strong>
        </div>
      </div>
    </div>
  );
}
