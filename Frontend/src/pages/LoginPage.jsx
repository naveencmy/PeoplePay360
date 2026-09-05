import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { login as apiLogin } from '../api/realApi';
import { useThemeStore } from '../store/themeStore';
import {
  Mail, LockKeyhole, Eye, EyeOff, CircleAlert,
  Sun, Moon, ArrowLeft, CheckCircle2
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // View state: 'login' | 'forgot-password'
  const [view, setView] = useState('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('core.kernelraise@gmail.com');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateLoginForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Enter a valid work email.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Enter a valid work email.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Live backend authentication
      const { user, token } = await apiLogin(email.trim(), password);
      let mappedRole = 'employee';
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') mappedRole = 'admin';
      else if (user.role === 'HR' || user.role === 'HR_ADMIN') mappedRole = 'hr_manager';
      else if (user.role === 'MANAGER' || user.role === 'PAYROLL_OFFICER') mappedRole = 'hr_payroll_manager';
      else if (user.role === 'PAYROLL_USER') mappedRole = 'hr_payroll_user';

      const userObj = {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || email.split('@')[0],
        email: user.email,
        role: mappedRole,
        employeeId: user.employee_id || null,
        token: token,
      };

      if (token) {
        localStorage.setItem('token', token);
      }

      // Check remember me preference
      if (rememberMe) {
        localStorage.setItem('peoplepay_remember_email', email.trim());
      } else {
        localStorage.removeItem('peoplepay_remember_email');
      }

      const success = await login(userObj);

      if (success) {
        if (userObj.role === 'employee') {
          navigate('/my-space');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage('Failed to initialize session.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim() || !emailRegex.test(forgotEmail.trim())) {
      setErrorMessage('Enter a valid work email.');
      return;
    }

    setErrorMessage('');
    setIsForgotLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Security standard: neutral message regardless of whether the email exists
      setForgotSubmitted(true);
    } catch (err) {
      setErrorMessage('Unable to process request right now. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090C15] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative transition-colors duration-150">
      {/* Background Ambience: Subtle Radial Depth */}
      <div
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(37,99,235,0.04),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(59,130,246,0.05),transparent)]"
        aria-hidden="true"
      />

      {/* Header: Quiet Top-Right Theme Switcher */}
      <header className="w-full flex justify-end z-10">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </header>

      {/* Main Authentication Container */}
      <main className="w-full max-w-[420px] mx-auto z-10 py-6">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="xl" className="mb-2" />
          <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            PeoplePay<span className="text-blue-600 dark:text-blue-500">360</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Payroll Intelligence & Workforce Operations
          </p>
        </div>

        {/* Refined Login Card */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-7 sm:p-8 shadow-sm sm:shadow-md transition-colors duration-150">
          {view === 'login' ? (
            <>
              {/* Card Header */}
              <div className="text-left mb-6">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Sign in to continue to your PeoplePay360 workspace.
                </p>
              </div>

              {/* Inline Compact Error Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 animate-fade-in"
                >
                  <CircleAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} noValidate className="space-y-4">
                {/* Work Email Field */}
                <div>
                  <label
                    htmlFor="work-email"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 text-left"
                  >
                    Work email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${fieldErrors.email ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
                        }`}
                    />
                    <input
                      id="work-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      placeholder="name@company.com"
                      className={`w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0E17] hover:bg-white dark:hover:bg-[#0E121E] focus:bg-white dark:focus:bg-[#0E121E] text-slate-900 dark:text-white border transition-colors outline-none ${fieldErrors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500'
                        }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-[11px] text-red-500 text-left font-normal">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="work-password"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot-password');
                        setErrorMessage('');
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <LockKeyhole
                      className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${fieldErrors.password ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
                        }`}
                    />
                    <input
                      id="work-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                      placeholder="••••••••"
                      className={`w-full h-10 pl-9 pr-10 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0E17] hover:bg-white dark:hover:bg-[#0E121E] focus:bg-white dark:focus:bg-[#0E121E] text-slate-900 dark:text-white border transition-colors outline-none ${fieldErrors.password
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1.5 text-[11px] text-red-500 text-left font-normal">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 bg-slate-50 dark:bg-[#0B0E17] cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Remember me</span>
                  </label>
                </div>

                {/* Sign In Primary Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign in</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Forgot Password View */
            <div className="animate-fade-in">
              <div className="text-left mb-6">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                  Reset password
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter your work email address to receive password recovery instructions.
                </p>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 animate-fade-in"
                >
                  <CircleAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {forgotSubmitted ? (
                <div className="space-y-5 text-left">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Instructions dispatched</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      If an account exists for this email, reset instructions will be sent.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setForgotSubmitted(false);
                      setErrorMessage('');
                    }}
                    className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to sign in</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} noValidate className="space-y-4 text-left">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Work email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        value={forgotEmail}
                        disabled={isForgotLoading}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-slate-50 dark:bg-[#0B0E17] hover:bg-white dark:hover:bg-[#0E121E] focus:bg-white dark:focus:bg-[#0E121E] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                    >
                      {isForgotLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending instructions...</span>
                        </>
                      ) : (
                        <span>Send reset instructions</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setErrorMessage('');
                      }}
                      className="w-full h-9 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to sign in</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Small Support / Help Footer */}
        <footer className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Need help?{' '}
            <a
              href="mailto:support@peoplepay360.internal"
              className="font-medium text-slate-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Contact your administrator
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 dark:text-slate-600">
            <span className="hover:text-slate-600 dark:hover:text-slate-400 cursor-pointer transition-colors">Privacy</span>
            <span>·</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
          </div>
        </footer>
      </main>

      {/* Bottom Spacer for Visual Balance */}
      <div className="w-full h-4" aria-hidden="true" />
    </div>
  );
}
