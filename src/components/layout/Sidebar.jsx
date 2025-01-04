import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Inbox, Mail, FolderOpen, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/blog-posts', icon: Newspaper, label: 'Blog Posts' },
    { path: '/contact-responses', icon: Inbox, label: 'Contact Responses' },
    { path: '/newsletter', icon: Mail, label: 'Newsletter' },
    { path: '/resources', icon: FolderOpen, label: 'Resources' },
  ];

  const settingsItems = [
    { path: '/settings/forgot-password', label: 'Reset Password' },
    // Add more settings items here as needed
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed: ' + error.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`
        fixed md:static inset-y-0 left-0 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        flex flex-col w-64 bg-white border-r border-gray-200 z-40
      `}
    >
      <div className="flex items-center justify-center h-16 bg-gradient-to-r from-primary-500 to-primary-600">
        <h1 className="text-xl font-bold text-white tracking-wide">Admin Panel</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onToggle}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 group
                  ${isActive(item.path)
                    ? 'bg-primary-50 text-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
                  }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  isActive(item.path) ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'
                }`} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Settings Section */}
        <div className="mt-6">
          <div className="px-4 py-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Settings
            </h2>
          </div>
          <ul className="space-y-1">
            {settingsItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onToggle}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 group
                    ${isActive(item.path)
                      ? 'bg-primary-50 text-primary-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-500'
                    }`}
                >
                  <Settings className={`w-4 h-4 mr-3 transition-colors ${
                    isActive(item.path) ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'
                  }`} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors duration-150 group"
        >
          <LogOut className="w-5 h-5 mr-3 transition-colors group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default Sidebar;

