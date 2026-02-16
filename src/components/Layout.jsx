import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, FileText, Bell, Settings,
    LogOut, Menu, X, User, Building2, Edit
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Mes Rapports', href: '/reports', icon: FileText },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Utilisateur', href: '/user', icon: User },
        { name: 'Logs', href: '/log', icon: Edit },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Barre supérieure */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <Building2 className="w-8 h-8 text-primary-600" />
                                <span className="text-xl font-bold text-gray-900">BATEX-CI</span>
                            </Link>
                        </div>

                        {/* Profil utilisateur */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                                <p className="text-xs text-gray-600">{user.department.name}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary-600" />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex items-center text-gray-600 hover:text-red-600 transition-colors"
                                    title="Déconnexion"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            mt-16 lg:mt-0
          `}
                >
                    <nav className="p-4 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${active
                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}

                        <button
                            onClick={handleLogout}
                            className="lg:hidden w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Déconnexion</span>
                        </button>
                    </nav>
                </aside>

                {/* Overlay pour mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Contenu principal */}
                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;