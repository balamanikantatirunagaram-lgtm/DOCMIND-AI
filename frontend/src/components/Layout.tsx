import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, LogOut, ChevronLeft, ChevronRight, Settings, X, Palette, Bell, Shield, User, Folder } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userPayload, setUserPayload] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserPayload(payload);
      } catch (e) {
        console.error('Failed to parse token');
      }
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Folders', path: '/folders', icon: Folder },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "border-r-4 border-border bg-card flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-4 border-b-4 border-border flex items-center justify-between h-20">
          {!isSidebarCollapsed && (
            <Link to="/">
              <h1 className="font-pixel text-2xl font-bold tracking-tighter">DOCMIND<span className="text-blue-600">.AI</span></h1>
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-border transition-all rounded-sm ml-auto"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 font-pixel text-sm border-2 border-transparent transition-all',
                  isActive 
                    ? 'bg-text text-white shadow-[4px_4px_0px_0px_#2563EB]' 
                    : 'text-text hover:border-border hover:shadow-[4px_4px_0px_0px_#111]',
                  isSidebarCollapsed && "justify-center px-0"
                )}
                title={isSidebarCollapsed ? item.name : undefined}
              >
                <Icon size={20} className={isSidebarCollapsed ? "mx-auto" : ""} />
                {!isSidebarCollapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div 
          onClick={() => setIsSettingsOpen(true)}
          className="border-t-4 border-border p-4 bg-gray-50 hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-3"
          title="Open Settings"
        >
          <div className="h-10 w-10 bg-blue-100 border-2 border-border flex items-center justify-center flex-shrink-0">
            <span className="font-pixel font-bold text-blue-600 text-lg">
              {userPayload?.name ? userPayload.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          {!isSidebarCollapsed && userPayload && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="font-pixel text-sm font-bold truncate">{userPayload.name || 'User'}</p>
              <p className="font-sans text-xs text-gray-500 truncate">{userPayload.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-border w-full max-w-lg shadow-[16px_16px_0px_0px_#111] max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b-4 border-border bg-[#FAFAFA]">
              <h2 className="font-pixel text-xl font-bold flex items-center gap-2"><Settings size={20} className="text-blue-600" /> Settings</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-border transition-all bg-white shadow-[2px_2px_0px_0px_#111]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-8">
              {/* Profile Section */}
              <div className="bg-blue-50 border-4 border-border p-4 shadow-[4px_4px_0px_0px_#111]">
                <h3 className="font-pixel font-bold mb-4 flex items-center gap-2 text-blue-800"><User size={18} /> Profile</h3>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-blue-200 border-4 border-border flex items-center justify-center shadow-[4px_4px_0px_0px_#111]">
                    <span className="font-pixel font-bold text-blue-700 text-3xl">
                      {userPayload?.name ? userPayload.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-pixel font-bold text-xl text-gray-900">{userPayload?.name || 'User'}</p>
                    <p className="font-sans text-gray-600">{userPayload?.email}</p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border-4 border-border p-4 shadow-[4px_4px_0px_0px_#111]">
                   <h3 className="font-pixel font-bold mb-2 flex items-center gap-2 text-yellow-800"><Palette size={18} /> Appearance</h3>
                   <div className="flex gap-2 mt-4">
                     <div className="w-8 h-8 bg-white border-2 border-border cursor-pointer shadow-[2px_2px_0px_0px_#111]"></div>
                     <div className="w-8 h-8 bg-[#111] border-2 border-border cursor-pointer opacity-50"></div>
                     <div className="w-8 h-8 bg-blue-600 border-2 border-border cursor-pointer opacity-50"></div>
                   </div>
                </div>

                <div className="bg-green-50 border-4 border-border p-4 shadow-[4px_4px_0px_0px_#111]">
                   <h3 className="font-pixel font-bold mb-2 flex items-center gap-2 text-green-800"><Bell size={18} /> Notifications</h3>
                   <div className="flex items-center justify-between mt-4">
                     <span className="font-sans text-sm text-green-900 font-bold">Email Alerts</span>
                     <div className="w-10 h-5 bg-green-500 border-2 border-border relative">
                       <div className="w-4 h-4 bg-white border-2 border-border absolute right-0 -top-0.5 shadow-[2px_2px_0px_0px_#111]"></div>
                     </div>
                   </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-purple-50 border-4 border-border p-4 shadow-[4px_4px_0px_0px_#111]">
                <h3 className="font-pixel font-bold mb-2 flex items-center gap-2 text-purple-800"><Shield size={18} /> Security</h3>
                <p className="font-sans text-sm text-purple-900 mb-4">Manage your account security and sessions.</p>
                <button className="font-pixel text-sm px-4 py-2 border-2 border-border bg-white shadow-[2px_2px_0px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                  Change Password
                </button>
              </div>
              
              <div className="pt-4 border-t-4 border-dashed border-gray-300">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center justify-center gap-2 font-pixel p-4 border-4 border-border bg-red-400 hover:bg-red-500 text-white shadow-[6px_6px_0px_0px_#111] hover:shadow-[2px_2px_0px_0px_#111] hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-lg"
                >
                  <LogOut size={20} /> LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b-4 border-border bg-card flex items-center px-6">
          <div className="flex-1" />
          {/* Header actions (optional) */}
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
