import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDepartmentById, getDepartmentMenuItems } from '../config/departments';
import {
    LayoutDashboard, FileText, Bell, LogOut, Menu, X, User, Building2,
    BarChart3, DollarSign, TrendingUp, Lightbulb, Search, Cpu, Package,
    CheckCircle, ShoppingCart, Palette, Archive, ArrowRightLeft, Users, FileCheck,
    UserCheck, AlertCircle, Server, Calendar,
    Shield, Eye, Target, Wrench, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';

// Map des icônes disponibles
const iconMap = {
    LayoutDashboard,
    FileText,
    Bell,
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
    Calendar,
    Shield,
    Eye,
    Target,
    Tool: Wrench,
    Building: Building2,
};

function ThemeToggleButton() {
    return null;
}

const DepartmentLayout = () => {
    const { user, logout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [notifications, setNotifications] = useState([
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Détecter la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);

            // Sur mobile, sidebar fermée par défaut
            if (width < 768) {
                setSidebarOpen(false);
                setSidebarCollapsed(false);
            }
            // Sur tablette, sidebar semi-collapsée
            else if (width >= 768 && width < 1024) {
                setSidebarCollapsed(true);
                setSidebarOpen(false);
            }
            // Sur desktop, sidebar ouverte par défaut
            else {
                setSidebarCollapsed(false);
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const departmentId = user?.department?.id ?? user?.department_id;

    // Attendre auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200  animate-spin mx-auto mb-3"></div>
                    <div className="text-gray-600 text-sm" style={{color:department.color}}>Chargement...</div>
                </div>
            </div>
        );
    }

    // Utilisateur absent
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-600 text-sm">Utilisateur non connecté</div>
            </div>
        );
    }

    // Département absent dans user
    if (!departmentId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-600 text-sm">Département utilisateur introuvable</div>
            </div>
        );
    }

    // Données locales (config)
    const department = getDepartmentById(Number(departmentId));
    const menuItems = getDepartmentMenuItems(Number(departmentId)) || [];

    // Département non trouvé dans config
    if (!department) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-600 text-sm">
                    Département introuvable dans la configuration (ID: {departmentId})
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
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

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    };

    const closeAllMenus = () => {
        setShowNotifications(false);
        setShowProfileMenu(false);
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            {/* Header - Fixed */}
            <header
                className="flex-shrink-0 shadow-sm border-b z-40"
                style={{
                    backgroundColor: department.color,
                    borderBottomColor: department.color,
                }}
            >
                <div className="px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        {/* LEFT SECTION */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Menu Button - Mobile */}
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-all duration-200 active:scale-95"
                                aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            >
                                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>

                            {/* Collapse Button - Desktop */}
                            {!isMobile && (
                                <button
                                    type="button"
                                    onClick={toggleSidebar}
                                    className="hidden lg:flex p-2 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                                    aria-label={sidebarCollapsed ? "Étendre le menu" : "Réduire le menu"}
                                >
                                    {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                                </button>
                            )}

                            {/* Logo */}
                            <Link
                                to={department.dashboardPath}
                                className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 duration-200"
                            >
                                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                                <div className="text-white">
                                    <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold block leading-tight">
                                        BATEX-CI
                                    </span>
                                    <span className="text-[10px] sm:text-xs opacity-90 hidden sm:inline-block">
                                        {department.icon} {department.name}
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* RIGHT SECTION */}
                        <div className="flex items-center gap-1 sm:gap-6 md:gap-6">

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        setShowProfileMenu(false);
                                    }}
                                    className="relative p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200 active:scale-95"
                                    aria-label="Notifications"
                                >
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40 lg:hidden"
                                            onClick={() => setShowNotifications(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl z-50 animate-slide-down max-h-96 overflow-y-auto">
                                            <div className="sticky top-0 bg-white flex justify-between items-center p-3 sm:p-4 border-b z-10">
                                                <h4 className="font-semibold text-sm sm:text-base">Notifications</h4>
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {unreadCount}
                                                </span>
                                            </div>

                                            <div>
                                                {notifications.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500 text-sm">
                                                        Aucune notification
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={`p-3 sm:p-4 hover:bg-gray-50 transition cursor-pointer border-b last:border-b-0 ${
                                                                !notif.read ? 'bg-blue-50' : ''
                                                            }`}
                                                            onClick={() => {
                                                                setNotifications(prev =>
                                                                    prev.map(n =>
                                                                        n.id === notif.id ? { ...n, read: true } : n
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            <h6 className="text-sm font-medium">{notif.title}</h6>
                                                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div className="sticky bottom-0 bg-white text-center p-2 sm:p-3 border-t">
                                                <Link
                                                    to={`${department.dashboardPath}/notifications`}
                                                    className="text-xs sm:text-sm font-medium hover:underline"
                                                    style={{ color: department.color }}
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    Voir toutes les notifications
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Profile */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowProfileMenu(!showProfileMenu);
                                        setShowNotifications(false);
                                    }}
                                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/20 transition-all duration-200 active:scale-95"
                                    aria-label="Profil"
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px]">
                                            {user?.full_name || 'Utilisateur'}
                                        </p>
                                        <p className="text-[10px] text-white/80">
                                            {user?.role
                                                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                                                : ''}
                                        </p>
                                    </div>
                                </button>

                                {/* Profile Dropdown */}
                                {showProfileMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40 lg:hidden"
                                            onClick={() => setShowProfileMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 animate-slide-down">
                                            <div className="p-3 border-b">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user?.full_name || 'Utilisateur'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {user?.email || ''}
                                                </p>
                                            </div>

                                            <Link
                                                to={`${department.dashboardPath}/settings`}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <Settings className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">Paramètres</span>
                                            </Link>

                                            <div className="border-t">
                                                <button
                                                    type="button"
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="text-sm">Déconnexion</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content with Sidebar */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar Overlay - Mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden animate-fade-in"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        flex-shrink-0 bg-white border-r border-gray-200
                        transition-all duration-300 ease-in-out
                        ${isMobile ? 'w-64' : sidebarCollapsed ? 'w-20' : 'w-64'}
                        ${sidebarOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0'}
                        h-full overflow-hidden
                        relative z-40
                    `}
                >
                    {/* Sidebar Content - No scroll, fixed height */}
                    <div className="h-full flex flex-col">
                        {/* Navigation - Takes available space, no overflow */}
                        <nav className="flex-1 p-3 sm:p-4 space-y-1">
                            {menuItems.map((item) => {
                                const IconComp = iconMap[item.icon] || FileText;
                                const active = isActive(item.href);
                                const href = item.href === 'dashboard'
                                    ? department.dashboardPath
                                    : `${department.dashboardPath}/${item.href}`;

                                return (
                                    <Link
                                        key={`${item.name}-${item.href}`}
                                        to={href}
                                        onClick={() => {
                                            if (isMobile) setSidebarOpen(false);
                                            closeAllMenus();
                                        }}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                            ${active ? 'font-medium' : 'text-gray-700 hover:bg-gray-100'}
                                            ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}
                                            group relative
                                        `}
                                        style={
                                            active
                                                ? {
                                                    backgroundColor: `${department.color}15`,
                                                    color: department.color,
                                                }
                                                : {}
                                        }
                                    >
                                        <IconComp
                                            className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                                                active ? '' : 'text-gray-500'
                                            }`}
                                            style={active ? { color: department.color } : {}}
                                        />

                                        {(!sidebarCollapsed || isMobile) && (
                                            <span className="text-sm">{item.name}</span>
                                        )}

                                        {/* Tooltip for collapsed sidebar */}
                                        {sidebarCollapsed && !isMobile && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                                {item.name}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Mobile Logout Button - Fixed at bottom */}
                        <div className="lg:hidden p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm">Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Styles for animations */}
            <style>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slide-down {
                    animation: slide-down 0.2s ease-out;
                }

                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }

                /* Custom scrollbar for main content */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }

                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                /* Ensure no scroll on sidebar */
                .overflow-hidden {
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default DepartmentLayout;