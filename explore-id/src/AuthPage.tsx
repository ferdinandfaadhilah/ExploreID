
import "./AuthPage.css";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";

type AuthPageProps = {
  mode: "login" | "register";
  onNavigate: (page: "login" | "register" | "home" | "profile") => void;
};

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { signIn, signUp, signInWithOAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<
    "google" | "github" | null
  >(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (isRegister && password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const result = await signUp(fullName, email, password);

        if (result.error) {
          setError(result.error);
          return;
        }

        setMessage(
          "Pendaftaran berhasil! Silakan cek email untuk konfirmasi akun jika diminta."
        );
      } else {
        const result = await signIn(email, password);

        if (result.error) {
          setError(result.error);
          return;
        }

        onNavigate("profile");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    setError("");
    setMessage("");
    setOauthLoading(provider);

    try {
      const result = await signInWithOAuth(provider);

      if (result.error) {
        setError(result.error);
        setOauthLoading(null);
      }
    } catch {
      setError("Gagal menghubungkan akun. Silakan coba lagi.");
      setOauthLoading(null);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-wrapper">

        {/* LEFT VISUAL PANEL */}
        <section className="auth-visual">
          <button
            className="auth-back"
            onClick={() => onNavigate("home")}
            type="button"
          >
            <span>←</span> Back to ExploreID
          </button>

          <div className="auth-visual-content">
            <div className="auth-brand">
              Explore<span>ID.</span>
            </div>

            <div className="auth-visual-heading">
              <span className="auth-kicker">
                DISCOVER INDONESIA
              </span>

              <h1>
                Your next
                <br />
                adventure
                <br />
                <span>starts here.</span>
              </h1>

              <p>
                Temukan tempat baru, jelajahi keindahan Indonesia,
                dan simpan destinasi favoritmu dalam satu tempat.
              </p>
            </div>

            <div className="auth-visual-card">
              <div className="auth-visual-card-image">
                <div className="auth-image-overlay">
                  <span>EXPLORE MORE</span>
                  <h3>Beautiful Indonesia</h3>
                  <p>Discover places worth remembering.</p>
                </div>
              </div>

              <div className="auth-visual-card-footer">
                <span>01 — 100+ DESTINATIONS</span>
                <span>EXPLOREID</span>
              </div>
            </div>
          </div>

          <div className="auth-visual-footer">
            <span>Made for curious explorers.</span>
            <span>© 2026 ExploreID</span>
          </div>
        </section>

        {/* RIGHT FORM PANEL */}
        <section className="auth-form-panel">
          <div className="auth-form-top">
            <span>
              {isRegister ? "START YOUR JOURNEY" : "WELCOME BACK"}
            </span>

            <p>
              {isRegister
                ? "Already have an account?"
                : "New to ExploreID?"}

              <button
                type="button"
                onClick={() =>
                  onNavigate(isRegister ? "login" : "register")
                }
              >
                {isRegister ? "Log in" : "Create account"}
              </button>
            </p>
          </div>

          <div className="auth-form-container">
            <div className="auth-mobile-brand">
              Explore<span>ID.</span>
            </div>

            <div className="auth-form-heading">
              <span className="auth-kicker">
                {isRegister ? "CREATE ACCOUNT" : "YOUR JOURNEY CONTINUES"}
              </span>

              <h2>
                {isRegister ? "Create an account" : "Welcome back"}
              </h2>

              <p>
                {isRegister
                  ? "Daftar dan mulai temukan destinasi favoritmu."
                  : "Masuk ke akunmu dan lanjutkan eksplorasimu."}
              </p>
            </div>

            {/* SOCIAL LOGIN */}
            <div className="auth-social-buttons">
              <button
                type="button"
                className="auth-social-button"
                onClick={() => handleOAuth("google")}
                disabled={loading || oauthLoading !== null}
              >
                <span className="google-icon">G</span>
                {oauthLoading === "google"
                  ? "Connecting..."
                  : "Continue with Google"}
              </button>

              <button
                type="button"
                className="auth-social-button"
                onClick={() => handleOAuth("github")}
                disabled={loading || oauthLoading !== null}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.25-5.1 5.52.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"
                  />
                </svg>

                {oauthLoading === "github"
                  ? "Connecting..."
                  : "Continue with GitHub"}
              </button>
            </div>

            <div className="auth-divider">
              <span>OR CONTINUE WITH EMAIL</span>
            </div>

            {/* EMAIL FORM */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {isRegister && (
                <div className="auth-field">
                  <label htmlFor="fullName">Full name</label>

                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email address</label>

                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>

                <div className="auth-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div className="auth-field">
                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="auth-alert auth-alert-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="auth-alert auth-alert-success">
                  {message}
                </div>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading || oauthLoading !== null}
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                    ? "Create account"
                    : "Sign in"}

                {!loading && <span>→</span>}
              </button>
            </form>

            <p className="auth-bottom-text">
              By continuing, you agree to use ExploreID responsibly
              and respect the information provided by destination managers.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
