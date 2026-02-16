import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, User, AlertCircle } from 'lucide-react';
import { branding } from '../config/brandingConstant.js';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const backgroundStyle = {
        background: branding.createRadialGradient(branding.primaryColor, branding.secondaryColor),
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(credentials);
        console.log("Credentials envoyés :", credentials);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4" style={backgroundStyle}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img src={branding.logo} alt="BATEX-CI Logo" className="w-36 h-16" />
                    </div>
                    <p className="text-gray-600">{branding.tagline}</p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="label">
                            <User className="w-4 h-4 inline mr-2" />
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Entrez votre nom d'utilisateur"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">
                            <Lock className="w-4 h-4 inline mr-2" />
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Entrez votre mot de passe"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: branding.secondaryColor, color: 'white' }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                {/* Info compte test */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                        <strong>Compte de test:</strong><br />
                        Utilisateur: resp_[depart]<br />
                        Mot de passe: Test@123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
