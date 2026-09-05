import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import CommandSearch from '../ui/CommandSearch';
import useThemeStore from '@/store/themeStore';

export default function AppShell() {
  const [commandSearchOpen, setCommandSearchOpen] = useState(false);
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initTheme]);

  return (
    <div className="min-h-screen bg-surface-0 text-text-main flex flex-col font-sans transition-colors duration-200">
      <TopBar onOpenCommandSearch={() => setCommandSearchOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-surface-0 min-h-[calc(100vh-3.5rem)]">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Command Search Palette */}
      <CommandSearch 
        isOpen={commandSearchOpen} 
        onClose={() => setCommandSearchOpen(false)} 
      />
    </div>
  );
}
