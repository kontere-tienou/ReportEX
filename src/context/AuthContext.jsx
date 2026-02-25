import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Charger l'utilisateur depuis localStorage au démarrage (si existe)
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');

                // Pas de token => pas connecté
                if (!token) {
                    setUser(null);
                    return;
                }

                // ✅ CORRECTION: getProfile() existe dans api.js (pas getCurrentUser)
                const response = await authService.getProfile();

                // Selon ton backend, les données peuvent être dans response.data.data.user
                // ou response.data.user
                const payload = response?.data?.data || response?.data;
                const freshUser = payload?.user || payload;

                if (freshUser) {
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                } else {
                    // Réponse inattendue => déconnexion de sécurité
                    logout();
                }
            } catch (error) {
                // Token invalide / expiré
                logout();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            // ✅ Nettoyage minimal : email trim, password inchangé (important)
            const payloadToSend = {
                email: credentials.email?.trim(),
                password: credentials.password, // ne pas trim par défaut
            };

            const response = await authService.login(payloadToSend);

            // Ton backend renvoie probablement:
            // { success, message, data: { user, tokens: { accessToken, refreshToken } } }
            // ou directement { user, tokens }
            const payload = response?.data?.data || response?.data;

            const userData = payload?.user;
            const tokens = payload?.tokens;

            // ✅ Validation de sécurité
            if (!userData || !tokens?.accessToken) {
                return {
                    success: false,
                    message: "Réponse serveur invalide (user/tokens manquants)",
                };
            }

            localStorage.setItem('token', tokens.accessToken);

            // facultatif mais utile si refresh token utilisé plus tard
            if (tokens.refreshToken) {
                localStorage.setItem('refreshToken', tokens.refreshToken);
            }

            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Erreur de connexion',
            };
        }
    };

    const logout = async () => {
        try {
            // Appel backend pour audit log / logout
            await authService.logout();
        } catch (error) {
            // Même si ça échoue (token expiré / réseau), on continue la déconnexion locale
            console.warn("Erreur logout API (ignorée):", error?.response?.data || error.message);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return context;
};