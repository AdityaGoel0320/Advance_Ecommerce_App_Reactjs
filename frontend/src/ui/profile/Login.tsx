import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../lib/firebase";
import Label from "./Label";
import Loading from "../Loading";

const Login = ({ setLogin }: any) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const handleLogin = async (e: any) => {
    e.preventDefault();
    if (loading) return;
    setErrMsg("");
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const { email, password }: any = Object.fromEntries(formData);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: any) {
      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No user found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Email or password does not match.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Unable to connect. Check your connection and try again.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled. Please contact the store.";
          break;
        case "auth/operation-not-allowed":
        case "auth/invalid-api-key":
        case "auth/unauthorized-domain":
          errorMessage = "Sign-in is unavailable. Please contact the store.";
          break;
        // Add more cases as needed
        default:
          errorMessage = "An error occurred. Please try again.";
      }
      console.log("Error", error);
      setErrMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="panel mx-auto max-w-lg pb-8">
      <form
        onSubmit={handleLogin}
        className="mx-auto p-6 sm:p-8"
      >
        <div className="border-b border-line pb-5">
          <h2 className="text-2xl font-bold text-ink">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-subtle">
            Please sign in to continue
          </p>
        </div>

        <div className="pb-5">
          <div className="mt-5 grid grid-cols-1 gap-5">
            <div>
              <Label title="Email address" htmlFor="login-email" />
              <div className="mt-2">
                <input
                  name="email"
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm text-ink focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <div>
              <Label title="Password" htmlFor="login-password" />
              <div className="mt-2">
                <input
                  name="password"
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block h-11 w-full rounded-xl border border-line bg-muted px-4 text-sm text-ink focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {errMsg && (
          <p className="bg-white/90 text-red-600 text-center py-1 rounded-md tracking-wide font-semibold">
            {errMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="primary-button mt-5 w-full"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="px-6 text-sm leading-6 text-subtle text-center">
        New to YourKart?{" "}
        <button
          onClick={() => setLogin(false)}
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          Register
        </button>
      </p>
      {loading && <Loading compact label="Signing you in securely..." />}
    </div>
  );
};

export default Login;
