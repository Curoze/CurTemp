"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clientIp, setClientIp] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    fetch("/api/v1/get-ip")
      .then((res) => res.json())
      .then((data) => {
        const cleanIp = data.ip.replace(/^::ffff:/i, "");
        setClientIp(cleanIp);
      })
      .catch((err) => console.error("Failed to get IP:", err));
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        ipAddress: clientIp,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-[#060818] via-blue-950 to-[#060818]"
          : "bg-gradient-to-br from-blue-50 via-white to-blue-50"
      }`}
    >
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
            : "bg-white text-gray-800 hover:bg-gray-100 shadow-lg"
        }`}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div
        className={`p-8 rounded-2xl w-full max-w-md transition-all duration-300 ${
          theme === "dark"
            ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 shadow-2xl"
            : "bg-white shadow-xl border border-gray-200"
        }`}
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="Logo"
              className="h-10"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <h2
            className={`text-xl font-semibold mb-1 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome Back
          </h2>
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              theme === "dark"
                ? "bg-red-900/30 text-red-400 border border-red-800/50"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter your username"
              className={`w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
                  : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onKeyDown={handleKeyPress}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
                  : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
            } disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </div>

        {clientIp && (
          <div
            className={`mt-6 p-3 rounded-lg text-xs text-center ${
              theme === "dark"
                ? "bg-blue-900/20 text-blue-400 border border-blue-800/30"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            Connected from: {clientIp}
          </div>
        )}
      </div>
    </div>
  );
}
