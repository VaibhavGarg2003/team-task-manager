import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderKanban, ListTodo,
  Activity, LogOut, Menu, X
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/activity', icon: Activity, label: 'Activity' },
];

const Sidebar = ({ mobile, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`
      ${mobile ? 'fixed inset-0 z-50' : 'hidden lg:flex'}
      flex flex-col w-64 bg-surface-900 border-r border-surface-800 h-screen
    `}>
      {mobile && (
        <div className="fixed inset-0 bg-black/50 -z-10" onClick={onClose} />
      )}

      {/* logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <ListTodo size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-surface-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* user info at bottom */}
      <div className="px-3 py-4 border-t border-surface-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-200 truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-lg text-sm text-surface-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* desktop sidebar */}
      <Sidebar />

      {/* mobile sidebar */}
      {sidebarOpen && <Sidebar mobile onClose={() => setSidebarOpen(false)} />}

      {/* main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-surface-900/50 border-b border-surface-800 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-surface-400 hover:bg-surface-800"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        {/* page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
