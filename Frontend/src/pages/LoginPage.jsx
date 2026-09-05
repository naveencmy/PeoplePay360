import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Button, Input } from '../components/ui/index';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Determine role from demo email
      let role = 'employee';
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('hrmanager')) role = 'hr_manager';
      else if (email.includes('payrolluser')) role = 'hr_payroll_user';
      else if (email.includes('payroll')) role = 'hr_payroll_manager';

      login({
        id: 1,
        name: email.split('@')[0],
        email: email,
        role: role
      });

      if (role === 'employee') {
        navigate('/my-space');
      } else {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (email) => {
    setEmail(email);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#4F7CFF] rounded-lg mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-blue-500/20">
            P3
          </div>
          <h1 className="text-2xl font-bold text-[#E6EDF3] mb-2">Welcome back</h1>
          <p className="text-[#8B949E]">Sign in to continue to your workspace</p>
        </div>

        <div className="bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 mb-6 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#E6EDF3] mb-1.5">Work Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-[#0B0D10] border-[rgba(255,255,255,0.08)] text-[#E6EDF3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#E6EDF3] mb-1.5">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0B0D10] border-[rgba(255,255,255,0.08)] text-[#E6EDF3]"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4F7CFF] hover:bg-[#3B66E5] text-white py-2.5 rounded-lg mt-2 font-medium"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
          <h3 className="text-xs font-medium text-[#8B949E] uppercase tracking-wider mb-3">Demo Accounts</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fillDemo('admin@company.com')} className="text-xs px-2.5 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF]">Admin</button>
            <button type="button" onClick={() => fillDemo('hrmanager@company.com')} className="text-xs px-2.5 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF]">HR Mgr</button>
            <button type="button" onClick={() => fillDemo('payroll@company.com')} className="text-xs px-2.5 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF]">Payroll Mgr</button>
            <button type="button" onClick={() => fillDemo('payrolluser@company.com')} className="text-xs px-2.5 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF]">Payroll User</button>
            <button type="button" onClick={() => fillDemo('employee@company.com')} className="text-xs px-2.5 py-1.5 rounded bg-[#0B0D10] border border-[rgba(255,255,255,0.08)] text-[#E6EDF3] hover:border-[#4F7CFF]">Employee</button>
          </div>
        </div>

        <p className="text-center text-xs text-[#8B949E] mt-6">
          Accounts are created by an administrator.
        </p>
      </div>
    </div>
  );
}
