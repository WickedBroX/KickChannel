import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Play, Trophy, ShoppingBag,
  Gift, User, LogOut, Menu, X, MonitorPlay
} from 'lucide-react';
import clsx from 'clsx';

export const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MonitorPlay, label: 'Streams', path: '/streams' },
    { icon: Play, label: 'Best Moments', path: '/highlights' },
    { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
    { icon: ShoppingBag, label: 'Market', path: '/market' },
    { icon: Gift, label: 'Fortune Wheel', path: '/fortune-wheel' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  if (user?.is_admin) {
    navItems.push({ icon: User, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="flex h-screen bg-dark-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <span className="text-xl font-bold text-primary-500">GamerApp</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-primary-600/10 text-primary-500"
                    : "hover:bg-gray-800 text-gray-400 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.username}</span>
                <span className="text-xs text-primary-400">{user?.points} pts | {user?.tickets} tix</span>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-white">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-dark-900 border-b border-gray-800 p-4 flex items-center justify-between md:hidden">
            <span className="font-bold text-primary-500">GamerApp</span>
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
