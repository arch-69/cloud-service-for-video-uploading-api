import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AuthPanel from "./components/auth/AuthPanel";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import UserDashboard from "./components/dashboard/UserDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import SettingsPanel from "./components/dashboard/SettingsPanel";
import UploadPanel from "./components/upload/UploadPanel";
import UploadList from "./components/upload/UploadList";
import ActivityFeed from "./components/shared/ActivityFeed";
import VideoPlayer from "./components/upload/VideoPlayer";
import Pricing from "./components/pricing/Pricing";
import { useAuth } from "./hooks/useAuth";
import { useUploadRecords } from "./hooks/useUploadRecords";
import { useMultipartUpload } from "./hooks/useMultipartUpload";

function App() {
  const [routeVideoKey, setRouteVideoKey] = useState(null);
  const [currentPath, setCurrentPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handleRoute = () => {
      const pathname = window.location.pathname;
      setCurrentPath(pathname);
      const m = pathname.match(/^\/video\/(.+)$/);
      if (m) {
        setRouteVideoKey(decodeURIComponent(m[1]));
      } else {
        setRouteVideoKey(null);
      }
    };
    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);
  const [activeView, setActiveView] = useState("dashboard");
  const [theme, setTheme] = useState(() =>
    window.localStorage.getItem("cloud_theme") || "dark"
  );

  const {
    user,
    users,
    login,
    register,
    logout,
    googleSignIn,
    startGoogleSignIn,
  } = useAuth();
  const {
    records,
    activities,
    saveRecord,
    logActivity,
    isLoading,
    refresh,
  } = useUploadRecords();

  const uploadControls = useMultipartUpload({
    user,
    onRecordUpdate: saveRecord,
    onActivity: logActivity,
  });

  const uploadPanelProps = {
    onUpload: uploadControls.uploadFile,
    onPause: uploadControls.pauseUpload,
    onResume: uploadControls.resumeUpload,
    onCancel: uploadControls.cancelUpload,
    status: uploadControls.status,
    progress: uploadControls.progress,
    isPaused: uploadControls.isPaused,
    currentUpload: uploadControls.currentUpload,
    bitrateHistory: uploadControls.bitrateHistory,
    error: uploadControls.error,
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("cloud_theme", theme);
  }, [theme]);

  const userRecords = useMemo(() => {
    if (!user) {
      return [];
    }
    return records;
  }, [records, user]);

  const scopedActivities = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "admin") {
      return activities;
    }

    return activities.filter(
      (activity) => activity.ownerId === user.id
    );
  }, [activities, user]);

  if (!user) {
    return (
      <AuthPanel
        onLogin={login}
        onRegister={register}
        onGoogleSignIn={async () => {
          const idToken = await startGoogleSignIn();
          if (!idToken) throw new Error("No id token received from Google");
          const result = await googleSignIn(idToken);
          if (!result.ok) throw new Error(result.error || "Google sign-in failed");
        }}
      />
    );
  }

  return (
    <div className="app-shell">
 <Sidebar     
        activeView={activeView}
        onNavigate={setActiveView}
        role={user.role}
      />

      <main className="app-main">
        <Header
          user={user}
          onLogout={logout}
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) =>
              prev === "dark" ? "light" : "dark"
            )
          }
        />

        <section className="app-content">
          {routeVideoKey ? (
            <VideoPlayer keyId={routeVideoKey} />
          ) : currentPath === '/pricing' ? (
            <Pricing />
          ) : activeView === "dashboard" && (
            user.role === "admin" ? (
              <AdminDashboard
                records={records}
                activities={activities}
                users={users}
              />
            ) : (
              <UserDashboard
                records={userRecords}
                activities={scopedActivities}
                currentUpload={uploadControls.currentUpload}
                uploadControls={uploadPanelProps}
                isLoading={isLoading}
                onRefresh={refresh}
              />
            )
          )}

          {activeView === "uploads" && (
            <div className="dashboard-grid">
              <UploadPanel {...uploadPanelProps} />
              <UploadList records={userRecords} title="Upload history" />
            </div>
          )}

          {activeView === "activity" && (
            <ActivityFeed activities={scopedActivities} />
          )}

          {activeView === "admin" && user.role === "admin" && (
            <AdminDashboard
              records={records}
              activities={activities}
              users={users}
            />
          )}

          {activeView === "settings" && (
            <SettingsPanel user={user} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;