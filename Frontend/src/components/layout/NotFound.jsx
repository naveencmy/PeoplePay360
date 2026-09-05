import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-screen bg-[#0B0D10]">
      <div className="text-[#4F7CFF] text-6xl font-bold mb-4">404</div>
      <h2 className="text-2xl font-semibold text-[#E6EDF3] mb-2">Page not found</h2>
      <p className="text-[#8B949E] mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="px-4 py-2 bg-[#4F7CFF] text-white rounded text-sm font-medium hover:bg-[#3B66E5] transition-colors">
        Return Home
      </Link>
    </div>
  );
}
