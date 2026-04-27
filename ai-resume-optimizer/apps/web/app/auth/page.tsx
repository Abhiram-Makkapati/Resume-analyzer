"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { Button } from "../../components/button";
import { Card } from "../../components/card";
import { useAuth } from "../../components/auth-provider";

export default function AuthPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setError("");
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }

      router.push("/dashboard");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed.");
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <div>
          <h1>Sign in to your optimizer workspace.</h1>
          <p className="muted">Use Google or email/password to manage scans across web, mobile, and extension.</p>
        </div>

        <Button
          variant="secondary"
          onClick={async () => {
            await signInWithGoogle();
            router.push("/dashboard");
          }}
        >
          <Chrome size={16} />
          Continue with Google
        </Button>

        <div className="split-line">or</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit">{mode === "signin" ? "Sign in" : "Create account"}</Button>
        </form>

        <button className="button button-ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </Card>
    </div>
  );
}
