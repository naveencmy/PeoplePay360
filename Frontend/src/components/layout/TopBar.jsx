import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function TopBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-[#111418] border-b border-[rgba(255,255,255,0.08)] flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="w-8 h-8 bg-[#4F7CFF] rounded flex items-center justify-center font-bold text-white shadow-sm">
          P3
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <div className="group relative py-4 cursor-pointer">
            <span className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors">Employees ▾</span>
            <div className="absolute top-14 left-0 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded shadow-xl py-2 min-w-[200px] hidden group-hover:block z-50">
              <Link to="/employees" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">All Employees</Link>
              <Link to="/contracts" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Contracts</Link>
              <Link to="/schedules" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Working Schedules</Link>
            </div>
          </div>

          <Link to="/attendance" className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors py-4">Attendance</Link>

          <div className="group relative py-4 cursor-pointer">
            <span className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors">Time Off ▾</span>
            <div className="absolute top-14 left-0 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded shadow-xl py-2 min-w-[200px] hidden group-hover:block z-50">
              <Link to="/time-off" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Requests</Link>
              <Link to="/time-off/allocations" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Allocations</Link>
              <Link to="/time-off/types" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Types</Link>
            </div>
          </div>

          <div className="group relative py-4 cursor-pointer">
            <span className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors">Payroll ▾</span>
            <div className="absolute top-14 left-0 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded shadow-xl py-2 min-w-[200px] hidden group-hover:block z-50">
              <Link to="/dashboard" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Dashboard</Link>
              <Link to="/payruns" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Payruns</Link>
              <Link to="/payslips" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Payslips</Link>
              <Link to="/salary-structures" className="block px-4 py-2 text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">Salary Structures</Link>
            </div>
          </div>

          <Link to="/simulator" className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors py-4 flex items-center gap-2">
            Simulator
            <span className="bg-[#4F7CFF]/20 text-[#4F7CFF] text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Intelligence</span>
          </Link>

          <Link to="/my-space" className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors py-4">
            My Space
          </Link>

          <Link to="/admin/users" className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors py-4">
            Admin
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-[#8B949E] hover:text-[#E6EDF3]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="group relative cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#161B22] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium hidden sm:block">{user?.name || 'User'}</span>
          </div>
          <div className="absolute top-10 right-0 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded shadow-xl py-2 min-w-[180px] hidden group-hover:block z-50">
            <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.08)] mb-1">
              <div className="text-sm text-[#E6EDF3] font-medium">{user?.name}</div>
              <div className="text-xs text-[#8B949E] truncate">{user?.email}</div>
            </div>
            <Link to="/my-space" className="block px-4 py-2 text-sm text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">
              My Space
            </Link>
            <Link to="/admin/users" className="block px-4 py-2 text-sm text-[#8B949E] hover:bg-[#0B0D10] hover:text-[#E6EDF3]">
              User Management
            </Link>
            <div className="border-t border-[rgba(255,255,255,0.08)] my-1"></div>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#0B0D10] hover:text-red-300">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
