"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import styles from "./styles.module.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    if (!tokenHash || type !== "recovery") {
      setError(
        "Invalid or expired reset link. Please request a new password reset."
      );
      return;
    }

    // Verify the token on page load
    const verifyToken = async () => {
      setLoading(true);
      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });

        if (verifyError) {
          throw verifyError;
        }
      } catch (err: any) {
        setError(
          err.message ||
            "Failed to verify reset link. Please request a new one."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const validatePasswords = () => {
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return false;
      }
      setError("");
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    // Get token hash from URL
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");

    if (!tokenHash) {
      setError(
        "Invalid or expired reset link. Please request a new password reset."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(
        "Password updated successfully! You can now close this window and log in to the app with your new password."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Reset Password</h1>
      {error && <div className={styles.error}>{error}</div>}
      {!error && (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <div className={styles.passwordRequirements}>
              Password must be at least 8 characters long
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            Reset Password
          </button>
          {loading && <div className={styles.loading} />}
          {success && <div className={styles.success}>{success}</div>}
        </form>
      )}
    </div>
  );
}
