import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useResetPassword } from "../hooks/useAuth";
import { Lock, Eye, EyeOff, Check, X, Shield, TrendingUp, Zap, Sparkles, KeyRound, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const checks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
  };

  const isStrongPassword =
    checks.length && checks.uppercase && checks.lowercase && checks.number;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isStrongPassword) {
      setError(
        "Password does not meet the required strength"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await resetPasswordMutation.mutateAsync({ token, newPassword });

      setMessage(res.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Premium animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-accent-800 to-secondary-900">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
            <Lock className="w-12 h-12 text-white/10" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
            <Shield className="w-16 h-16 text-white/10" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-float" style={{ animationDelay: '4s' }}>
            <KeyRound className="w-10 h-10 text-white/10" />
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
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Smart Financial Tracker
            </h1>
          </div>
          <p className="text-primary-100 text-sm font-medium">Create Your New Password</p>
        </div>

        {/* Glassmorphism card */}
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in">
          {/* Card glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-accent-400 rounded-3xl blur opacity-20"></div>
          
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-primary-600 to-accent-600 p-8 overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `linear-gradient(45deg, transparent 45%, white 50%, transparent 55%)`,
                backgroundSize: '20px 20px'
              }}></div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
                <p className="text-primary-50 text-sm">Choose a strong password for your account</p>
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
                      <p className="text-xs text-success-700 dark:text-success-300 mt-1">Redirecting to login...</p>
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

              {/* New Password input */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password strength indicators */}
                {newPassword && (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${checks.length ? 'text-success-600 dark:text-success-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>At least 8 characters</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${checks.uppercase ? 'text-success-600 dark:text-success-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>One uppercase letter</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${checks.lowercase ? 'text-success-600 dark:text-success-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>One lowercase letter</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${checks.number ? 'text-success-600 dark:text-success-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>One number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Passwords don't match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-success-600 dark:text-success-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Reset password button */}
              <button
                type="submit"
                disabled={loading || !isStrongPassword}
                className="w-full relative overflow-hidden bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Back to login link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Shield className="w-4 h-4 text-primary-200" />
            <span className="text-sm text-primary-50 font-medium">Your password is encrypted and secure</span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <TrendingUp className="w-5 h-5 text-primary-200" />
            </div>
            <p className="text-xs text-primary-100 font-medium">Secure Reset</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <Shield className="w-5 h-5 text-primary-200" />
            </div>
            <p className="text-xs text-primary-100 font-medium">Encrypted</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <Zap className="w-5 h-5 text-primary-200" />
            </div>
            <p className="text-xs text-primary-100 font-medium">Instant Access</p>
          </div>
        </div>
      </div>

      <style>{`
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

export default ResetPassword;
