import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageSquare, Menu, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect } from 'react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="font-pixel text-2xl font-bold tracking-tighter">DOCMIND<span className="text-blue-600">.AI</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 font-pixel text-sm border border-transparent transition-all',
                  isActive 
                    ? 'bg-text text-white shadow-pixel' 
                    : 'text-text hover:border-border hover:shadow-pixel'
                )}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center px-6">
          <button className="lg:hidden mr-4 border border-border p-2 shadow-pixel">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <button onClick={handleLogout} className="flex items-center gap-2 font-pixel text-sm border border-border px-3 py-1 shadow-pixel hover:bg-gray-100 transition-colors">
            Logout <LogOut size={14} />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
