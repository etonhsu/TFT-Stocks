import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { Portfolio } from '../components/dashboard/Portfolio';
import { UserTransactionsContainer } from "../containers/user/UserTransactionsContainer";
import { MainContent } from "../containers/general/MainContent";
import { Text } from "../containers/dashboard/TextStyle";
import styled from "styled-components";
import { UserChart } from "../components/user/UserChart";
import { PortfolioContainer } from "../containers/dashboard/PortfolioContainer";
import {
    UserAccountColumn,
    UserAccountContainer,
    UserAccountDetailsContainer
} from "../containers/user/UserContainer";
import { formatCurrency } from "../utils/CurrencyFormatter";
import { useAuth } from '../utils/Authentication';
import {FavoritesEntry, LeagueWithPortfolio} from "./Dashboard.tsx"; // Import useAuth

interface UserSummary {
    username: string;
    leagues: LeagueWithPortfolio[];
    favorites: FavoritesEntry[];
    current_league_id: number;
    league_id: number;
}

const TextContainer = styled.div`
  display: flex;
  flex-direction: column; // Aligns children vertically
`;

const ValueLabel = styled.p`
    margin-top: 25px; // Reduces the space below the paragraph
    margin-bottom: 0;
    font-size: 14px; // Set the size as needed
    color: #EAEAEA;
`;

const AccountValue = styled.h2`
    margin: 0; // Reduces the space above the heading
    font-size: 40px; // Increase font size as needed
    color: #EAEAEA;
`;

export const UserProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>(); // Specify the type for useParams
    const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const { token } = useAuth(); // Use useAuth to get the token
    const navigate = useNavigate();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch(`${backendUrl}/users/${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setUserSummary(data);
                } else {
                    throw new Error(data.detail || 'Failed to fetch user data');
                }
            } catch (error) {
                setError('Failed to load user data');
                setLoading(false);
                navigate('/');
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [backendUrl, username, token]);

    if (loading) {
        return (<MainContent className="mainContentContainer">Loading...</MainContent>);
    }
    if (error) {
        return (<MainContent className="mainContentContainer">Error: No data available.</MainContent>);
    }
    if (!userSummary) return <MainContent className="mainContentContainer">No user data available.</MainContent>;

    // Use league_id instead of current_league_id to find the correct league to display
    let displayedLeague = userSummary.leagues.find(league => league.league.id === userSummary.league_id);

    if (!displayedLeague) {
        // Default to the set league (league_id = 2) if the displayed league is not found
        displayedLeague = userSummary.leagues.find(league => league.league.id === 2);
    }

    if (!displayedLeague) {
        return (<MainContent className="mainContentContainer">Error: Displayed league not found.</MainContent>);
    }

    const total = displayedLeague.portfolio_history.length > 0 ? displayedLeague.portfolio_history[displayedLeague.portfolio_history.length - 1].value : undefined;

    return (
        <MainContent>
            <TextContainer>
                <Text size="52px" weight="bold" color='#EAEAEA' padding='10px 5px 0px 5px'>{userSummary.username}</Text>
                <Text size="22px" weight="bold" color='#EAEAEA' padding='0 0 10px 7px'>
                    {displayedLeague.rank === 0 ? 'Rank n/a' : `Rank #${displayedLeague.rank}`}
                </Text>
            </TextContainer>
            <UserAccountContainer>
                <UserAccountColumn>
                    <UserAccountDetailsContainer label={"Overview"}>
                        <ValueLabel>Account Value: </ValueLabel>
                        <AccountValue>{total !== undefined ? formatCurrency(total, 2) : 'N/A'}</AccountValue>
                    </UserAccountDetailsContainer>
                    <UserTransactionsContainer label={"Recent Transactions"}>
                        {displayedLeague.transactions.slice().reverse().slice(0, 7).map((transaction, index) => (
                            <div key={index}>
                                <p>{transaction.type} | {transaction.gameName} | {transaction.shares} Shares</p>
                            </div>
                        ))}
                    </UserTransactionsContainer>
                </UserAccountColumn>
                <UserChart portfolioHistory={displayedLeague.portfolio_history} />
            </UserAccountContainer>
            <PortfolioContainer label={'Portfolio'}>
                {displayedLeague.portfolio.players && <Portfolio players={displayedLeague.portfolio.players} />}
            </PortfolioContainer>
        </MainContent>
    );
}
