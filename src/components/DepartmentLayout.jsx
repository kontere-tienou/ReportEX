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
import { Icon } from "@iconify/react/dist/iconify.js";

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

function ThemeToggleButton() {
    return null;
}

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

    let [sidebarActive, seSidebarActive] = useState(false);
    let [mobileMenu, setMobileMenu] = useState(false);
    let sidebarControl = () => {
        seSidebarActive(!sidebarActive);
    };
    let mobileMenuControl = () => {
        setMobileMenu(!mobileMenu);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Barre supérieure avec couleur du département*/}
            <header
  className="shadow-sm border-b sticky top-0 z-40"
  style={{
    backgroundColor: department.color,
    borderBottomColor: department.color
  }}
>
  <div className="px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">

      {/* ================= LEFT : Logo & Toggle ================= */}
            <div className="flex items-center">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden mr-4 text-white hover:text-gray-100 transition"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <Link to={department.dashboardPath} className="flex items-center space-x-3">
                    <Building2 className="w-8 h-8 text-white" />
                    <div className="text-white">
                        <span className="text-xl font-bold block">BATEX-CI</span>
                        <span className="text-xs opacity-90">
              {department.icon} {department.name}
            </span>
                    </div>
                </Link>
            </div>

            {/* ================= RIGHT : Controls ================= */}
            <div className="flex items-center space-x-4 text-white">

                {/* Theme Toggle */}
                <ThemeToggleButton />

                {/* Language Dropdown */}
                <div className="relative group">
                    <button className="w-9 h-9 rounded-full overflow-hidden border border-white/30 hover:ring-2 hover:ring-white transition">
                        <img
                            src="assets/images/lang-flag.png"
                            alt="lang"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-3 border-b font-semibold text-sm">
                            Choose Language
                        </div>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                            🇬🇧 English
                        </button>
                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                            🇫🇷 Français
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="relative group">
                    <button className="relative p-2 rounded-full hover:bg-white/20 transition">
                        <Bell size={20} />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              5
            </span>
                    </button>

                    <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h4 className="font-semibold">Notifications</h4>
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                05
              </span>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            <div className="p-4 hover:bg-gray-50 transition">
                                <h6 className="text-sm font-medium">Congratulations 🎉</h6>
                                <p className="text-xs text-gray-500">
                                    Your profile has been verified.
                                </p>
                            </div>

                            <div className="p-4 hover:bg-gray-50 transition">
                                <h6 className="text-sm font-medium">Ronald Richards</h6>
                                <p className="text-xs text-gray-500">
                                    You can stitch between artboards.
                                </p>
                            </div>
                        </div>

                        <div className="text-center p-3 border-t">
                            <Link
                                to="#"
                                className="text-sm font-medium"
                                style={{ color: department.color }}
                            >
                                Voir tous
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="relative group flex items-center space-x-2">

                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium">
                            {user.full_name}
                        </p>
                        <p className="text-xs opacity-80">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </p>
                    </div>

                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition">
                        <User className="w-5 h-5 text-white" />
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 top-14 w-56 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <Link
                            to="view-profile"
                            className="block px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                            Mon Profile
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                        >
                            Déconnexion
                        </button>
                    </div>

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