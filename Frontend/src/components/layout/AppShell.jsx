import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import useAuthStore from '../../store/authStore';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#E6EDF3] flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-[#0B0D10]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
