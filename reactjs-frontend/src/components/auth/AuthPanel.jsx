import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import GoogleAuthProvider from "./GoogleAuthProvider";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export default function AuthPanel({ onLogin, onRegister, onGoogleSignIn }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (mode === "register") {
      const result = await onRegister(form);
      if (!result.ok) {
        setMessage(result.error);
        setIsLoading(false);
        return;
      }

      setMessage(result.message);
      setMode("login");
    } else {
      const result = await onLogin({
        email: form.email,
        password: form.password,
      });
      if (!result.ok) {
        setMessage(result.error);
      }
    }

    setIsLoading(false);
  };

  return (
    <section className="auth">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1>CloudDock</h1>
            <p>Professional multipart upload workspace</p>
          </div>
        </div>

        <div className="auth-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Jane Doe"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@company.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="••••••••"
              required
            />
          </label>

          {message && <p className="form-error">{message}</p>}

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading
              ? "Please wait..."
              : mode === "register"
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Use your backend credentials to sign in.</p>
          <div style={{ marginTop: 12 }}>
            <GoogleAuthProvider
              onClick={async () => {
                if (!onGoogleSignIn) return;
                setIsLoading(true);
                setMessage(null);
                try {
                  await onGoogleSignIn();
                } catch (err) {
                  setMessage(err?.message || 'Google sign-in failed');
                }
                setIsLoading(false);
              }}
              disabled={isLoading}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
