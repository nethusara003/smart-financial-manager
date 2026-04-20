import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGuestLogin, useLogin, useVerifyTwoFactorLogin } from "../hooks/useAuth";
import { storeAuthenticatedSession, storeGuestSession } from "../utils/authStorage";
import { Mail, Lock, TrendingUp, Shield, Zap, Eye, EyeOff, ArrowRight, User, Sparkles } from 'lucide-react';

const TWO_FACTOR_TOKEN_STORAGE_KEY = "login_2fa_token";
const TWO_FACTOR_EMAIL_STORAGE_KEY = "login_2fa_email";
const TRUSTED_DEVICE_ID_STORAGE_KEY = "trusted_device_id";
const TRUSTED_DEVICE_TOKEN_STORAGE_KEY = "trusted_2fa_device_token";

function createFallbackDeviceId() {
  return `device_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateTrustedDeviceId() {
  const existing = localStorage.getItem(TRUSTED_DEVICE_ID_STORAGE_KEY);
  if (existing && existing.trim()) {
    return existing.trim();
  }

  const generated = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : createFallbackDeviceId();

  localStorage.setItem(TRUSTED_DEVICE_ID_STORAGE_KEY, generated);
  return generated;
}

function Login({ setAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => {
    // Load remembered email on component mount
    return localStorage.getItem("rememberedEmail") || "";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState(
    () => sessionStorage.getItem(TWO_FACTOR_TOKEN_STORAGE_KEY) || ""
  );
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMessage, setTwoFactorMessage] = useState(() => {
    if (sessionStorage.getItem(TWO_FACTOR_TOKEN_STORAGE_KEY)) {
      return "Enter the verification code sent to your email.";
    }

    return "";
  });
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if there's a remembered email
    return !!localStorage.getItem("rememberedEmail");
  });

  const loginMutation = useLogin();
  const verifyTwoFactorLoginMutation = useVerifyTwoFactorLogin();
  const guestLoginMutation = useGuestLogin();

  const completeAuthenticatedLogin = (data) => {
    const normalizedUser = {
      id: data._id || data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      privacySettings: data.privacySettings,
    };

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    storeAuthenticatedSession({
      token: data.token,
      user: normalizedUser,
      rememberMe,
    });

    if (data.currency) {
      localStorage.setItem("currency", data.currency);
    }

    if (data.privacySettings) {
      localStorage.setItem("privacySettings", JSON.stringify(data.privacySettings));
      window.dispatchEvent(new CustomEvent("privacy-settings-updated"));
    }

    if (typeof data?.trustedDeviceToken === "string" && data.trustedDeviceToken.trim()) {
      localStorage.setItem(TRUSTED_DEVICE_TOKEN_STORAGE_KEY, data.trustedDeviceToken.trim());
    } else if (data?.privacySettings?.twoFactorAuth === false) {
      localStorage.removeItem(TRUSTED_DEVICE_TOKEN_STORAGE_KEY);
    }

    sessionStorage.removeItem(TWO_FACTOR_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TWO_FACTOR_EMAIL_STORAGE_KEY);

    setAuth({
      isAuthenticated: true,
      isGuest: false,
      token: data.token,
      user: normalizedUser,
      initialized: true,
    });

    if (data.role === "admin" || data.role === "super_admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const isTwoFactorStep = Boolean(twoFactorToken);

  const beginTwoFactorStep = (data) => {
    const pendingToken = String(data.twoFactorToken || "");
    setTwoFactorToken(pendingToken);
    sessionStorage.setItem(TWO_FACTOR_TOKEN_STORAGE_KEY, pendingToken);
    sessionStorage.setItem(TWO_FACTOR_EMAIL_STORAGE_KEY, email.trim().toLowerCase());
    setTwoFactorCode("");
    setPassword("");
    setShowPassword(false);
    setTwoFactorMessage(data.message || "Verification code sent to your email.");
  };

  const resetTwoFactorStep = () => {
    setTwoFactorToken("");
    setTwoFactorCode("");
    setTwoFactorMessage("");
    setError("");
    sessionStorage.removeItem(TWO_FACTOR_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TWO_FACTOR_EMAIL_STORAGE_KEY);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isTwoFactorStep && twoFactorCode.length !== 6) {
      setError("Enter the 6-digit verification code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const deviceId = getOrCreateTrustedDeviceId();

      if (isTwoFactorStep) {
        const data = await verifyTwoFactorLoginMutation.mutateAsync({
          twoFactorToken,
          code: twoFactorCode,
          deviceId,
        });
        completeAuthenticatedLogin(data);
        return;
      }

      const trustedDeviceToken = localStorage.getItem(TRUSTED_DEVICE_TOKEN_STORAGE_KEY) || "";
      const data = await loginMutation.mutateAsync({
        email,
        password,
        deviceId,
        trustedDeviceToken,
      });

      if (data?.requiresTwoFactor && data?.twoFactorToken) {
        beginTwoFactorStep(data);
        return;
      }

      completeAuthenticatedLogin(data);
    } catch (error) {
      const message = error?.message || "Server not reachable";
      setError(message);

      if (isTwoFactorStep && /expired|verification token|challenge/i.test(message)) {
        resetTwoFactorStep();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await guestLoginMutation.mutateAsync();

      // Guest sessions are intentionally session-scoped.
      storeGuestSession({ token: data.token, rememberMe: false });

      setAuth({
        isAuthenticated: false,
        isGuest: true,
        token: data.token,
        user: null,
        initialized: true,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(error?.message || "Server not reachable");
      console.error("Guest login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Premium animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
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
            <TrendingUp className="w-12 h-12 text-white/10" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '2s' }}>
            <Shield className="w-16 h-16 text-white/10" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 animate-float" style={{ animationDelay: '4s' }}>
            <Zap className="w-10 h-10 text-white/10" />
          </div>
          <div className="absolute top-1/2 right-1/3 animate- float" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-14 h-14 text-white/10" />
          </div>
        </div>
      </div>

      {/* Premium glassmorphism login card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Smart Financial Tracker
            </h1>
          </div>
          <p className="text-primary-100 text-sm font-medium">Secure Financial Management Platform</p>
        </div>

        {/* Glassmorphism card */}
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in">
          {/* Card glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-3xl blur opacity-20"></div>
          
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 p-8 overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `linear-gradient(45deg, transparent 45%, white 50%, transparent 55%)`,
                backgroundSize: '20px 20px'
              }}></div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
                <p className="text-primary-50 text-sm">Access your financial dashboard</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
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

              {isTwoFactorStep && twoFactorMessage && (
                <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                  <p className="text-sm font-medium text-primary-800 dark:text-primary-200">{twoFactorMessage}</p>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isTwoFactorStep}
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 disabled:bg-gray-100 dark:bg-gray-800 dark:disabled:bg-gray-700/70 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password or verification code input */}
              {!isTwoFactorStep ? (
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      data-testid="login-password-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="two-factor-code" className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Verification Code
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      id="two-factor-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                      required
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 tracking-[0.35em]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Check your email inbox for the verification code.</p>
                </div>
              )}

              {/* Remember Me checkbox and Forgot password */}
              <div className="flex items-center justify-between">
                {/* Remember Me checkbox */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isTwoFactorStep}
                    className="w-4 h-4 text-primary-600 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    Remember me
                  </label>
                </div>

                {!isTwoFactorStep ? (
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={resetTwoFactorStep}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Back to password login
                  </button>
                )}
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                data-testid="login-submit-button"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isTwoFactorStep ? "Verifying..." : "Signing in..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isTwoFactorStep ? "Verify Code" : "Sign In"}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Divider */}
              {!isTwoFactorStep && (
                <>
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">or</span>
                    </div>
                  </div>

                  {/* Guest login button */}
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
                    <span>Continue as Guest</span>
                  </button>
                </>
              )}

              {/* Sign up link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Create one now
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
            <span className="text-sm text-primary-50 font-medium">Protected by enterprise-grade encryption</span>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <TrendingUp className="w-5 h-5 text-primary-200" />
            </div>
            <p className="text-xs text-primary-100 font-medium">Real-time Insights</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <Shield className="w-5 h-5 text-primary-200" />
            </div>
            <p className="text-xs text-primary-100 font-medium">Bank-level Security</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 mb-2">
              <Zap className="w-5 h-5 text-primary-200" />
            </div>
            <p className="text-xs text-primary-100 font-medium">Fast Analytics</p>
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
}

export default Login;
