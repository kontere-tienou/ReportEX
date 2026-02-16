import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDepartmentById, getDepartmentMenuItems } from '../config/departments';
import {
    LayoutDashboard, FileText, Bell, Settings, LogOut, Menu, X, User, Building2,
    BarChart3, DollarSign, TrendingUp, Lightbulb, Search, Cpu, Package,
    CheckCircle, ShoppingCart, Palette, Archive, ArrowRightLeft, Users, FileCheck,
    UserCheck, AlertCircle, Server, Calendar
} from 'lucide-react';

// Map des icônes disponibles
const iconMap = {
    LayoutDashboard,
    FileText,
    Bell,
    Settings,
    BarChart3,
    DollarSign,
    TrendingUp,
    Lightbulb,
    Search,
    Cpu,
    Package,
    CheckCircle,
    ShoppingCart,
    Palette,
    Archive,
    ArrowRightLeft,
    Users,
    FileCheck,
    UserCheck,
    AlertCircle,
    Server,
    Calendar
};

const DepartmentLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Obtenir les infos du département
    const department = getDepartmentById(user.department.id);
    const menuItems = getDepartmentMenuItems(user.department.id);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        const currentPath = location.pathname;
        const basePath = department.dashboardPath;

        if (path === 'dashboard') {
            return currentPath === basePath;
        }
        return currentPath.includes(`${basePath}/${path}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Barre supérieure avec couleur du département */}
            <header
                className="shadow-sm border-b sticky top-0 z-40"
                style={{
                    backgroundColor: department.color,
                    borderBottomColor: department.color
                }}
            >
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo et département */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden mr-4 text-white hover:text-gray-100"
                            >
                                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <Link to={department.dashboardPath} className="flex items-center space-x-3">
                                <Building2 className="w-8 h-8 text-white" />
                                <div className="text-white">
                                    <span className="text-xl font-bold block">BATEX-CI</span>
                                    <span className="text-xs opacity-90">{department.icon} {department.name}</span>
                                </div>
                            </Link>
                        </div>

                        {/* Profil utilisateur */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-white">{user.full_name}</p>
                                <p className="text-xs text-white opacity-80">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                                >
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex items-center text-white hover:text-gray-100 transition-colors"
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
                {/* Sidebar avec accent couleur département */}
                <aside
                    className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            mt-16 lg:mt-0
          `}
                >
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = iconMap[item.icon];
                            const active = isActive(item.href);
                            const href = item.href === 'dashboard'
                                ? department.dashboardPath
                                : `${department.dashboardPath}/${item.href}`;

                            return (
                                <Link
                                    key={item.name}
                                    to={href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${active
                                        ? 'font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                  `}
                                    style={active ? {
                                        backgroundColor: `${department.color}15`,
                                        color: department.color
                                    } : {}}
                                >
                                    {Icon && (
                                        <Icon
                                            className={`w-5 h-5`}
                                            style={active ? { color: department.color } : { color: '#6b7280' }}
                                        />
                                    )}
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

export default DepartmentLayout;