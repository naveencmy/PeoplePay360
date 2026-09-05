import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { login as apiLogin } from '../api/realApi';
import { Button, Input } from '../components/ui/index';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Real API authentication with backend PostgreSQL
      const { user, token } = await apiLogin(email, password);
      
      let mappedRole = 'employee';
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') mappedRole = 'admin';
      else if (user.role === 'HR' || user.role === 'HR_ADMIN') mappedRole = 'hr_manager';
      else if (user.role === 'MANAGER' || user.role === 'PAYROLL_OFFICER') mappedRole = 'hr_payroll_manager';

      login({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || email.split('@')[0],
        email: user.email,
        role: mappedRole,
        token: token,
      });

      if (mappedRole === 'employee') {
        navigate('/my-space');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0B0D10] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div 
            className="w-12 h-12 bg-[#4F7CFF] rounded-lg mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-blue-500/20"
            aria-hidden="true"
          >
            P3
          </div>
          <h1 className="text-2xl font-bold text-[#E6EDF3] mb-2">Welcome back</h1>
          <p className="text-[#8B949E]">Sign in to continue to your PeoplePay360 workspace</p>
        </header>

        <section aria-labelledby="login-form-heading" className="bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 mb-6 shadow-xl">
          <h2 id="login-form-heading" className="sr-only">Sign In Form</h2>
          
          {error && (
            <div 
              role="alert" 
              className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-red-300 text-sm flex items-center gap-2"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="work-email" className="block text-sm font-medium text-[#E6EDF3] mb-1.5">
                Work Email
              </label>
              <Input
                id="work-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
                aria-required="true"
                className="w-full bg-[#0B0D10] border-[rgba(255,255,255,0.08)] text-[#E6EDF3]"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[#E6EDF3] mb-1.5">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                aria-required="true"
                className="w-full bg-[#0B0D10] border-[rgba(255,255,255,0.08)] text-[#E6EDF3]"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4F7CFF] hover:bg-[#3B66E5] text-white py-2.5 rounded-lg mt-2 font-medium min-h-[44px]"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </section>

        <section aria-label="Demo Accounts" className="bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-3">Live PostgreSQL Demo Accounts</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              type="button" 
              onClick={() => fillDemo('admin@company.com')} 
              aria-label="Load demo Admin credentials"
              className="text-xs px-3 py-2 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF] min-h-[40px]"
            >
              Admin
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo('hrmanager@company.com')} 
              aria-label="Load demo HR Manager credentials"
              className="text-xs px-3 py-2 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF] min-h-[40px]"
            >
              HR Mgr
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo('payroll@company.com')} 
              aria-label="Load demo Payroll Manager credentials"
              className="text-xs px-3 py-2 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF] min-h-[40px]"
            >
              Payroll Mgr
            </button>
            <button 
              type="button" 
              onClick={() => fillDemo('employee@company.com')} 
              aria-label="Load demo Employee credentials"
              className="text-xs px-3 py-2 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF] min-h-[40px]"
            >
              Employee
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
