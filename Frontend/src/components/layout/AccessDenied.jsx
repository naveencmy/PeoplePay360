import { Link } from 'react-router-dom';

export default function AccessDenied() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[500px]">
      <div className="w-16 h-16 bg-[#161B22] rounded-full flex items-center justify-center mb-6 border border-[rgba(255,255,255,0.08)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F7CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
      </div>
      <h2 className="text-2xl font-semibold text-[#E6EDF3] mb-2">Access Denied</h2>
      <p className="text-[#8B949E] mb-8 max-w-md">
        You don't have permission to view this section. If you believe this is a mistake, please contact your administrator.
      </p>
      <Link to="/dashboard" className="px-4 py-2 bg-[#4F7CFF] text-white rounded text-sm font-medium hover:bg-[#3B66E5] transition-colors">
        Go to Dashboard
      </Link>
    </div>
  );
}
