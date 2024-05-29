// contexts/LeagueContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/Authentication';

interface LeagueContextProps {
    currentLeagueId: number;
    setCurrentLeagueId: React.Dispatch<React.SetStateAction<number>>;
}

const LeagueContext = createContext<LeagueContextProps | undefined>(undefined);

export const LeagueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentLeagueId, setCurrentLeagueId] = useState<number>(0);
    const { token } = useAuth();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchCurrentLeague = async () => {
            try {
                const response = await axios.get(`${backendUrl}/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userSummary = response.data;
                setCurrentLeagueId(userSummary.current_league_id);
            } catch (error) {
                console.error('Error fetching current league:', error);
            }
        };

        fetchCurrentLeague();
    }, [backendUrl, token]);

    return (
        <LeagueContext.Provider value={{ currentLeagueId, setCurrentLeagueId }}>
            {children}
        </LeagueContext.Provider>
    );
};

export const useLeague = () => {
    const context = useContext(LeagueContext);
    if (!context) {
        throw new Error('useLeague must be used within a LeagueProvider');
    }
    return context;
};
