"use client";
import { useState } from "react";
import { Field } from "@/components/site/forms";
export function AdminLogin({ resetToken }: { resetToken?: string }) {
  const [mode, setMode] = useState("login"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const token = resetToken ?? null;
  const actual = token ? "reset" : mode;
  return (
    <main className="admin-login">
      <a href="/">
        <img
          src="/images/beloftebos-logo-256.webp"
          width="130"
          height="130"
          alt="BelofteBos Farmhouse Inn"
        />
      </a>
      <div className="form-panel">
        <span className="eyebrow">The farmhouse office</span>
        <h1>
          {actual === "login"
            ? "Welcome back."
            : actual === "setup"
              ? "Set up your office."
              : actual === "reset"
                ? "A fresh password."
                : "Reset your password."}
        </h1>
        <p>
          {actual === "login"
            ? "Sign in to manage your guests, rooms and website."
            : actual === "setup"
              ? "Use the private setup key supplied with your deployment."
              : "We’ll help you get back in."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              const v = {
                ...Object.fromEntries(new FormData(e.currentTarget)),
                token,
              };
              const r = await fetch("/api/auth/" + actual, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(v),
              });
              const d = await r.json();
              if (!r.ok) throw new Error(d.error);
              if (actual === "login") location.href = "/admin";
              else if (actual === "forgot") setMessage(d.message);
              else {
                setMessage("Your account is ready. Sign in to continue.");
                if (token) location.href = "/admin";
                else setMode("login");
              }
            } catch (e) {
              setMessage(e instanceof Error ? e.message : "Unable to sign in");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="form-grid">
            <div className="wide">
              {actual === "setup" && (
                <>
                  <Field label="Your name" name="name" required />
                  <Field
                    label="Private setup key"
                    name="setup_token"
                    type="password"
                    required
                  />
                </>
              )}
              {actual !== "reset" && (
                <Field
                  label="Email address"
                  name="email"
                  type="email"
                  required
                />
              )}
              {actual !== "forgot" && (
                <Field
                  label={
                    actual === "login"
                      ? "Password"
                      : "Password (at least 14 characters)"
                  }
                  name="password"
                  type="password"
                  required
                />
              )}
            </div>
          </div>
          {message && (
            <div className="notice" role="status">
              {message}
            </div>
          )}
          <button className="button w-full" disabled={busy}>
            {busy
              ? "Please wait…"
              : actual === "login"
                ? "Sign in"
                : actual === "forgot"
                  ? "Send reset link"
                  : actual === "setup"
                    ? "Create administrator"
                    : "Save password"}
          </button>
        </form>
        <div className="login-links">
          <button
            onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}
          >
            {mode === "forgot" ? "Back to sign in" : "Forgot your password?"}
          </button>
          <button onClick={() => setMode(mode === "setup" ? "login" : "setup")}>
            {mode === "setup" ? "Back to sign in" : "First-time setup"}
          </button>
        </div>
      </div>
      <a className="text-link" href="/">
        Back to the website
      </a>
    </main>
  );
}
