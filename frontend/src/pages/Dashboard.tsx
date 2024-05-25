import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {Portfolio, Player, Hold} from '../components/dashboard/Portfolio.tsx';
import {Transaction} from "../components/transactions/RecentTransactions.tsx";
import {UserAccount} from "../components/dashboard/UserAccount.tsx";
import axios from 'axios';
import {MainContent} from "../containers/general/MainContent.tsx";
import {AccountColumn, AccountDetailsContainer, AccountContainer} from "../containers/dashboard/AccountContainer.tsx";
import {UserChart} from "../components/user/UserChart.tsx";
import {PortfolioContainer} from "../containers/dashboard/PortfolioContainer.tsx";
import { useAuth } from '../utils/Authentication.tsx';
// import {DashboardControls} from "../components/dashboard/DashboardRefresh.tsx";
import {PerformersDetailsContainer} from "../containers/dashboard/PerformersContainer.tsx";
import {TopPerformers} from "../components/dashboard/TopPerformers.tsx";
import {Text} from "../containers/dashboard/TextStyle.tsx";
import styled from "styled-components";
// import {ButtonContainer} from "../containers/dashboard/ButtonContainer.tsx";

export interface UserSummary {
    username: string;
    date_registered: string;
    leagues: LeagueWithPortfolio[];
    favorites: FavoritesEntry[];
    current_league_id: number;
}

export interface LeagueWithPortfolio {
    league: League;
    portfolio: Portfolio;
    portfolio_history: PortfolioHistoryData[];
    transactions: Transaction[];
    one_day_change: number;
    three_day_change: number;
    balance: number;
    rank: number;
}

export interface League {
    id: number;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    created_by: number | null;
}

export interface Portfolio {
    id: number;
    players: { [key: string]: Player };
    holds: Hold[];
}


export interface PortfolioHistoryData {
    id: number;
    value: number;
    date: string;
}

export interface FavoritesEntry {
    name: string;
    current_price: number;
    eight_hour_change: number;
    one_day_change: number;
    three_day_change: number;
}


const TextContainer = styled.div`
  display: flex;
  flex-direction: column; // Aligns children vertically
`;

export const Dashboard: React.FC = () => {
    const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
    const [isLoading, setLoading] = useState(true);
    const { token, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${backendUrl}/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserSummary(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoading(false);
                if (axios.isAxiosError(error) && error.response) {
                    console.error('Detailed Error:', error.response.data);
                    console.error('Status code:', error.response.status);
                    if (error.response.status === 401) {
                        navigate('/login');
                    } else if (error.response.status === 500) {
                        console.error('Server error, please try again later.');
                    }
                }
            }
        };
        fetchData();
    }, [backendUrl, isLoggedIn, navigate, token]);

    if (isLoading) {
        return (<MainContent className="mainContentContainer">Loading...</MainContent>);
    }
    if (!userSummary) {
        return (<MainContent className="mainContentContainer">Error: No data available.</MainContent>);
    }

    const currentLeague = userSummary.leagues.find(league => league.league.id === userSummary.current_league_id);

    if (!currentLeague) {
        return (<MainContent className="mainContentContainer">Error: Current league not found.</MainContent>);
    }

    return (
        <MainContent>
            <TextContainer>
                <Text size="52px" weight="bold" color='#EAEAEA' padding='10px 5px 0px 5px'>
                    {userSummary.username}
                </Text>
                <Text size="22px" weight="bold" color='#EAEAEA' padding='0 0 10px 7px'>
                  {currentLeague.rank === 0 ? 'Rank n/a' : `Rank #${currentLeague.rank}`}
                </Text>
            </TextContainer>
            <AccountContainer>
                <AccountColumn>
                    <AccountDetailsContainer label={"Overview"}>
                        <UserAccount currentLeague={currentLeague} />
                    </AccountDetailsContainer>
                    <PerformersDetailsContainer label={"Top Performers"}>
                        <TopPerformers />
                    </PerformersDetailsContainer>
                </AccountColumn>
                <UserChart portfolioHistory={currentLeague.portfolio_history} />
            </AccountContainer>
            <PortfolioContainer label={'Portfolio'}>
                <Portfolio players={currentLeague.portfolio.players} holds={currentLeague.portfolio.holds} />
            </PortfolioContainer>
        </MainContent>
    );
};

