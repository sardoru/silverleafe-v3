import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Boxes, 
  FileText, 
  Settings, 
  Users, 
  Map, 
  BarChart2, 
  Shield, 
  LogOut,
  Menu,
  X,
  Search,
  Leaf,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../store';
import { UserRole } from '../types';
import NotificationDropdown from './NotificationDropdown';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { path: '/batches', icon: <Boxes size={20} />, label: 'Cotton Batches' },
      { path: '/map', icon: <Map size={20} />, label: 'Supply Chain Map' },
      { path: '/reports', icon: <FileText size={20} />, label: 'Reports' },
    ];

    // Role-specific items
    if (user?.role === UserRole.ADMIN) {
      return [
        ...commonItems,
        { path: '/fibretrace', icon: <RefreshCw size={20} />, label: 'Integrations' },
        { path: '/users', icon: <Users size={20} />, label: 'User Management' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
      ];
    } else if (user?.role === UserRole.BRAND) {
      return [
        ...commonItems,
        { path: '/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
        { path: '/fibretrace', icon: <RefreshCw size={20} />, label: 'Integrations' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
      ];
    } else if (user?.role === UserRole.AUDITOR) {
      return [
        ...commonItems,
        { path: '/compliance', icon: <Shield size={20} />, label: 'Compliance' },
        { path: '/fibretrace', icon: <RefreshCw size={20} />, label: 'Integrations' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 hover:text-gray-600 focus:outline-none touch-target"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Silverleafe</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors touch-target ${
                  isActive(item.path)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-medium">
                    {user?.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none touch-target"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex-1 flex">
              <div className="max-w-lg w-full lg:max-w-xs relative pl-12 lg:pl-0">
                <div className="absolute inset-y-0 left-12 lg:left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search batches, reports..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notification dropdown */}
              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;