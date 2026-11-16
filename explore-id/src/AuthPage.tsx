import "./AuthPage.css";

import { useState } from "react";
import { useAuth } from "./context/AuthContext";

type AuthPageProps = {
  mode: "login" | "register";
  onNavigate: (page: "login" | "register" | "home" | "profile") => void;
};

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <section className="auth-page">
      <div className="auth-card">
        <button
          className="auth-back"
          onClick={() => onNavigate("home")}
        >
          ← Back to ExploreID
        </button>

        <div className="auth-brand">
          Explore<span>ID.</span>
        </div>

        <span className="eyebrow">
          {isRegister ? "JOIN EXPLOREID" : "WELCOME BACK"}
        </span>

        <h1>
          {isRegister ? "Create your account." : "Welcome back."}
        </h1>

        <p className="auth-description">
          {isRegister
            ? "Buat akun untuk mulai menyimpan destinasi favoritmu."
            : "Login untuk melanjutkan perjalanan eksplorasimu."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {isRegister && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            onClick={() =>
              onNavigate(isRegister ? "login" : "register")
            }
          >
            {isRegister ? " Login" : " Register"}
          </button>
        </p>
      </div>
    </section>
  );
}
