import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth data on mount
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        const channelId = localStorage.getItem('channelId');

        if (accessToken && userId) {
            setUser({
                accessToken,
                userId,
                username,
                channelId,
            });
        }
        setLoading(false);
    }, []);

    const login = (data) => {
        // data should contain access_token and user object
        const { access_token, user: userData } = data;

        const accessToken = access_token;
        const userId = userData?.user_id;
        const username = userData?.username;
        const channelId = userData?.channel?.channel_id;

        // Save to localStorage
        localStorage.setItem('accessToken', accessToken);
        if (userId) localStorage.setItem('userId', userId);
        if (username) localStorage.setItem('username', username);
        if (channelId) localStorage.setItem('channelId', channelId);

        // Update state
        setUser({
            accessToken,
            userId,
            username,
            channelId,
        });
    };

    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('channelId');

        // Clear state
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
