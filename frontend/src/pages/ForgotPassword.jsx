import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Shield, TrendingUp, Zap, Sparkles, Check, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [cooldown, setCooldown] = useState(0);

  // ⏱ Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        { email }
      );

      setMessage(res.data.message);
      setCooldown(30); // 🔒 lock resend for 30s
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Premium animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-900 via-primary-800 to-secondary-900">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}></div>
        </div>

        {/* Floating financial icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 animate-float" style={{ animationDelay: '0s' }}>
            <KeyRound className="w-12 h-12 text-white/10" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
            <Shield className="w-16 h-16 text-white/10" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-float" style={{ animationDelay: '4s' }}>
            <Zap className="w-10 h-10 text-white/10" />
          </div>
          <div className="absolute top-1/2 right-1/3 animate-float" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-14 h-14 text-white/10" />
          </div>
        </div>
      </div>

      {/* Premium glassmorphism card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Smart Financial Tracker
            </h1>
          </div>
          <p className="text-accent-100 text-sm font-medium">Password Recovery</p>
        </div>

        {/* Glassmorphism card */}
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in">
          {/* Card glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent-400 to-primary-400 rounded-3xl blur opacity-20"></div>
          
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-accent-600 to-accent-700 p-8 overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `linear-gradient(45deg, transparent 45%, white 50%, transparent 55%)`,
                backgroundSize: '20px 20px'
              }}></div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-1">Forgot Password?</h2>
                <p className="text-accent-50 text-sm">No worries, we'll send you reset instructions</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Success message */}
              {message && (
                <div className="bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 rounded-xl p-4 animate-scale-in">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-success-800 dark:text-success-200">{message}</p>
                      <p className="text-xs text-success-700 dark:text-success-300 mt-1">Check your inbox and spam folder</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 rounded-xl p-4 animate-shake">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-danger-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm font-medium text-danger-800 dark:text-danger-200">{error}</p>
                  </div>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We'll send you a password reset link to this email
                </p>
              </div>

              {/* Send reset link button */}
              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full relative overflow-hidden bg-gradient-to-r from-accent-600 to-accent-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center">
                        <span className="text-xs font-bold">{cooldown}</span>
                      </div>
                      <span>Resend in {cooldown}s</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </div>
              </button>

              {/* Back to login link */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to login</span>
                </Link>
              </div>

              {/* Help text */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="text-accent-600 hover:text-accent-700 dark:text-accent-400 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Shield className="w-4 h-4 text-accent-200" />
            <span className="text-sm text-accent-50 font-medium">Secure password recovery process</span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <TrendingUp className="w-5 h-5 text-accent-200" />
            </div>
            <p className="text-xs text-accent-100 font-medium">Quick Recovery</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <Shield className="w-5 h-5 text-accent-200" />
            </div>
            <p className="text-xs text-accent-100 font-medium">100% Secure</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <Zap className="w-5 h-5 text-accent-200" />
            </div>
            <p className="text-xs text-accent-100 font-medium">Instant Email</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
