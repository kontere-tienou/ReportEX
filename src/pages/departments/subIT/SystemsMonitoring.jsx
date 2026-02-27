import { useState } from 'react';
import {
    Server, Cpu, HardDrive, Activity, RefreshCw, AlertCircle,
    CheckCircle, Wifi, Database, Shield, Zap, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const SystemsMonitoring = () => {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [selectedSystem, setSelectedSystem] = useState(null);

    const systems = [
        {
            id: 1,
            name: 'Serveur Principal',
            type: 'Application Server',
            status: 'operational',
            ip: '192.168.1.10',
            location: 'Datacenter',
            uptime: '0%',
            lastReboot: '0 jours',
            metrics: {
                cpu: 0,
                ram: 0,
                disk: 0,
                network: 0,
                temperature: 0
            },
            services: [
                { name: 'Apache', status: 'running', port: 80 },
                { name: 'MySQL', status: 'running', port: 3306 },
                { name: 'PHP-FPM', status: 'running', port: 9000 }
            ],
            history: [
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
            ]
        },
        {
            id: 2,
            name: 'Serveur Backup',
            type: 'Backup Server',
            status: 'operational',
            ip: '192.168.1.11',
            location: 'Datacenter A',
            uptime: '0%',
            lastReboot: '0 jours',
            metrics: {
                cpu: 0,
                ram: 0,
                disk: 0,
                network: 0,
                temperature: 0
            },
            services: [
                { name: 'Bacula', status: 'running', port: 9101 },
                { name: 'rsync', status: 'running', port: 873 }
            ],
            history: [
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
            ]
        },
        {
            id: 3,
            name: 'Firewall',
            type: 'Security',
            status: 'warning',
            ip: '192.168.1.1',
            location: 'DMZ',
            uptime: '0%',
            lastReboot: '0 jours',
            metrics: {
                cpu: 0,
                ram: 0,
                disk: 0,
                network: 0,
                temperature: 0
            },
            services: [
                { name: 'iptables', status: 'running', port: null },
                { name: 'fail2ban', status: 'running', port: null },
                { name: 'snort', status: 'warning', port: null }
            ],
            history: [
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
            ]
        },
        {
            id: 4,
            name: 'Database Server',
            type: 'Database',
            status: 'operational',
            ip: '192.168.1.12',
            location: 'Datacenter B',
            uptime: '0%',
            lastReboot: '0 jours',
            metrics: {
                cpu: 0,
                ram: 0,
                disk: 0,
                network: 0,
                temperature: 0
            },
            services: [
                { name: 'PostgreSQL', status: 'running', port: 5432 },
                { name: 'Redis', status: 'running', port: 6379 }
            ],
            history: [
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
                { time: '00:00', cpu: 0, ram: 0 },
            ]
        },
    ];

    const getStatusColor = (status) => {
        const colors = {
            operational: 'text-green-600 bg-green-100',
            warning: 'text-amber-600 bg-amber-100',
            critical: 'text-red-600 bg-red-100',
            offline: 'text-gray-600 bg-gray-100'
        };
        return colors[status] || colors.offline;
    };

    const getStatusIcon = (status) => {
        if (status === 'operational') return <CheckCircle className="w-5 h-5" />;
        if (status === 'warning') return <AlertCircle className="w-5 h-5" />;
        return <AlertCircle className="w-5 h-5" />;
    };

    const getMetricColor = (value) => {
        if (value > 85) return 'text-red-600';
        if (value > 75) return 'text-amber-600';
        return 'text-green-600';
    };

    const radarData = selectedSystem ? [
        { metric: 'CPU', value: selectedSystem.metrics.cpu, fullMark: 100 },
        { metric: 'RAM', value: selectedSystem.metrics.ram, fullMark: 100 },
        { metric: 'Disque', value: selectedSystem.metrics.disk, fullMark: 100 },
        { metric: 'Réseau', value: selectedSystem.metrics.network, fullMark: 100 },
        { metric: 'Temp', value: selectedSystem.metrics.temperature, fullMark: 70 },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Monitoring des Systèmes</h1>
                    <p className="text-gray-600 mt-1">Surveillance en temps réel de l'infrastructure IT</p>
                </div>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded text-cyan-600"
                        />
                        <span>Auto-refresh</span>
                    </label>
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Network Overview */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Wifi className="w-5 h-5 mr-2 text-cyan-600" />
                    Vue Réseau
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-green-700">Latence</span>
                            <Activity className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">12ms</p>
                        <p className="text-xs text-green-600 mt-1">Excellent</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-700">Bande passante</span>
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">95 Mbps</p>
                        <p className="text-xs text-blue-600 mt-1">Disponible</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-purple-700">Connexions actives</span>
                            <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-600">1,245</p>
                        <p className="text-xs text-purple-600 mt-1">Sessions</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Systèmes</p>
                            <p className="text-3xl font-bold text-gray-900">{systems.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Server className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Opérationnels</p>
                            <p className="text-3xl font-bold text-green-600">
                                {systems.filter(s => s.status === 'operational').length}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Alertes</p>
                            <p className="text-3xl font-bold text-amber-600">
                                {systems.filter(s => s.status === 'warning').length}
                            </p>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-full">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Uptime Moyen</p>
                            <p className="text-3xl font-bold text-cyan-600">99.5%</p>
                        </div>
                        <div className="bg-cyan-100 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-cyan-600" />
                        </div>
                    </div>
                </div>
            </div>*/}

            {/* Systems Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {systems.map((system) => (
                    <div
                        key={system.id}
                        className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
                            selectedSystem?.id === system.id ? 'ring-2 ring-cyan-500' : ''
                        }`}
                        onClick={() => setSelectedSystem(system)}
                    >
                        <div className="p-6">
                            {/* System Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${
                                        system.status === 'operational' ? 'bg-green-100' : 'bg-amber-100'
                                    }`}>
                                        <Server className={`w-6 h-6 ${
                                            system.status === 'operational' ? 'text-green-600' : 'text-amber-600'
                                        }`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{system.name}</h3>
                                        <p className="text-sm text-gray-500">{system.type}</p>
                                    </div>
                                </div>
                                <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(system.status)}`}>
                  {getStatusIcon(system.status)}
                                    <span className="ml-1 capitalize">{system.status}</span>
                </span>
                            </div>

                            {/* System Info */}
                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                <div>
                                    <p className="text-gray-500">IP</p>
                                    <p className="font-mono font-medium">{system.ip}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Location</p>
                                    <p className="font-medium">{system.location}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Uptime</p>
                                    <p className="font-medium text-green-600">{system.uptime}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Dernier redémarrage</p>
                                    <p className="font-medium">{system.lastReboot}</p>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-2">
                                {Object.entries(system.metrics).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 capitalize">{key}</span>
                                            <span className={`font-bold ${getMetricColor(value)}`}>
                        {value}{key === 'temperature' ? '°C' : '%'}
                      </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    value > 85 ? 'bg-red-500' :
                                                        value > 75 ? 'bg-amber-500' :
                                                            'bg-green-500'
                                                }`}
                                                style={{ width: `${key === 'temperature' ? (value/70)*100 : value}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Services */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Services</p>
                                <div className="flex flex-wrap gap-2">
                                    {system.services.map((service, idx) => (
                                        <span
                                            key={idx}
                                            className={`px-2 py-1 rounded text-xs ${
                                                service.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                      {service.name} {service.port && `(:${service.port})`}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Détails système sélectionné */}
            {selectedSystem && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Détails: {selectedSystem.name}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Historical Chart */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Historique 24h
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={selectedSystem.history}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="cpu" stroke="#06b6d4" name="CPU %" strokeWidth={2} />
                                    <Line type="monotone" dataKey="ram" stroke="#10b981" name="RAM %" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Radar Chart */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Vue d'ensemble des métriques
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="metric" />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                    <Radar name="Utilisation" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default SystemsMonitoring;