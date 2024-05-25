import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Portfolio, Player } from '../components/dashboard/Portfolio.tsx';
import axios from 'axios';
import {MainContent} from "../containers/general/MainContent.tsx";
import {useAuth} from "../utils/Authentication.tsx";

interface UserPortfolio {
    players: { [key: string]: Player };
}

export const PortfolioPage: React.FC = () => {
    const [userSummary, setUserSummary] = useState<UserPortfolio | null>(null);
    const [isLoading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook for navigation
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            // if (!token) {
            //     // No token found, redirect to login page or handle accordingly
            //     navigate('/login');
            //     return;
            // }

            try {
                const response = await axios.post(`${backendUrl}/portfolio`, {
                    headers: {
                        Authorization: `Bearer ${token}` // Use the token for authorization
                    }
                });
                setUserSummary(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoading(false);

                // If the server responds with a 401 Unauthorized status, handle it
                if (axios.isAxiosError(error)) {
                    console.error('Axios error status:', error.response?.status);
                    // Now you can safely access the response property if it exists
                    if (error.response?.status === 401) {
                        navigate('/login');
                    }
                }
            }
        };

        fetchData();
    }, [backendUrl, navigate]);

    if (isLoading) {return (<MainContent className="mainContentContainer">Loading...</MainContent>);}
    if (!userSummary) {return (<MainContent className="mainContentContainer">Error: No data available.</MainContent>);}

    return (
        <MainContent>
            <div>
                <Portfolio players={userSummary.players} />
            </div>
        </MainContent>
    );
};