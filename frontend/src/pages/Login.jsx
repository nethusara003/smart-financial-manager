import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Sparkles, TrendingUp, Shield, Zap, Eye, EyeOff, ArrowRight, User } from 'lucide-react';

function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ STORE AUTH DATA
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );
      localStorage.removeItem("guest");

      setAuth({
        isAuthenticated: true,
        isGuest: false,
        token: data.token,
        user: data,
      });

      // ✅ FIXED ROLE-BASED REDIRECT
      if (data.role === "admin" || data.role === "super_admin") {
        window.location.replace("/admin");
      } else {
        window.location.replace("/dashboard");
      }
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("guest", "true");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      isAuthenticated: false,
      isGuest: true,
      token: null,
      user: null,
    });

    window.location.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE - Premium Brand Section */}
      <div className="relative flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 lg:p-16 flex flex-col justify-center overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 max-w-xl">
          {/* Official SFT Logo */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <div className="relative">
              <img 
                src="/logo-sft.svg" 
                alt="SFT Logo" 
                className="w-16 h-16 drop-shadow-2xl"
              />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Smart Financial Tracker
              </h1>
              <p className="text-lg text-primary-100 font-medium mt-1">SFT</p>
            </div>
          </div>

          <p className="text-xl text-primary-100 mb-12 leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            Take control of your finances with our comprehensive tracking and analytics platform. Your journey to financial freedom starts here.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-lg">Real-time financial insights</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg">Bank-level security</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-lg">Lightning-fast analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Premium Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-scale-in">
          {/* Glass morphism card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
            {/* Card header with gradient */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '30px 30px'
              }}></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-primary-100">Access your financial dashboard</p>
              </div>
            </div>

            {/* Form content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-xl flex items-start gap-3 animate-slide-in-down">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Guest login button */}
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <User className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                <span>Continue as Guest</span>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Need help?</span>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                <Link
                  to="/forgot-password"
                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                >
                  Create new account
                </Link>
              </div>

              {/* Admin link if applicable */}
              {(() => {
                const auth = localStorage.getItem("user");
                if (!auth) return null;
                const user = JSON.parse(auth);
                if (user.role === "admin" || user.role === "super_admin") {
                  return (
                    <div className="pt-4 border-t border-gray-200">
                      <Link
                        to="/admin"
                        className="flex items-center justify-center gap-2 text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </div>
                  );
                }
                return null;
              })()}
            </form>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
