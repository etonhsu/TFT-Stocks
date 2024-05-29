import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Portfolio } from '../components/dashboard/Portfolio';
import { UserTransactionsContainer } from "../containers/user/UserTransactionsContainer";
import { MainContent } from "../containers/general/MainContent";
import { Text } from "../containers/dashboard/TextStyle";
import styled from "styled-components";
import { UserChart } from "../components/user/UserChart";
import { PortfolioContainer } from "../containers/dashboard/PortfolioContainer";
import {UserSummary} from "./Dashboard";
import {
    UserAccountColumn,
    UserAccountContainer,
    UserAccountDetailsContainer
} from "../containers/user/UserContainer";
import { formatCurrency } from "../utils/CurrencyFormatter";


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
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch(`${backendUrl}/users/${username}`);
                const data = await response.json();
                if (response.ok) {
                    setUserSummary(data);
                } else {
                    throw new Error(data.detail || 'Failed to fetch user data');
                }
            } catch (error) {
                setError('Failed to load user data');
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [backendUrl, username]);

    if (loading) {
        return (<MainContent className="mainContentContainer">Loading...</MainContent>);
    }
    if (error) {
        return (<MainContent className="mainContentContainer">Error: No data available.</MainContent>);
    }
    if (!userSummary) return <MainContent className="mainContentContainer">No user data available.</MainContent>;

    const currentLeague = userSummary.leagues.find(league => league.league.id === userSummary.current_league_id);

    if (!currentLeague) {
        return (<MainContent className="mainContentContainer">Error: Current league not found.</MainContent>);
    }

    const total = currentLeague.portfolio_history.length > 0 ? currentLeague.portfolio_history[currentLeague.portfolio_history.length - 1].value : undefined;

    return (
        <MainContent>
            <TextContainer>
                <Text size="52px" weight="bold" color='#EAEAEA' padding='10px 5px 0px 5px'>{userSummary.username}</Text>
                <Text size="22px" weight="bold" color='#EAEAEA' padding='0 0 10px 7px'>
                    {currentLeague.rank === 0 ? 'Rank n/a' : `Rank #${currentLeague.rank}`}
                </Text>
            </TextContainer>
            <UserAccountContainer>
                <UserAccountColumn>
                    <UserAccountDetailsContainer label={"Overview"}>
                        <ValueLabel>Account Value: </ValueLabel>
                        <AccountValue>{total !== undefined ? formatCurrency(total, 2) : 'N/A'}</AccountValue>
                    </UserAccountDetailsContainer>
                    <UserTransactionsContainer label={"Recent Transactions"}>
                        {currentLeague.transactions.slice().reverse().slice(0, 7).map((transaction, index) => (
                            <div key={index}>
                                <p>{transaction.type} | {transaction.gameName} | {transaction.shares} Shares</p>
                            </div>
                        ))}
                    </UserTransactionsContainer>
                </UserAccountColumn>
                <UserChart portfolioHistory={currentLeague.portfolio_history} />
            </UserAccountContainer>
            <PortfolioContainer label={'Portfolio'}>
                {currentLeague.portfolio.players && <Portfolio players={currentLeague.portfolio.players} />}
            </PortfolioContainer>
        </MainContent>
    );
}
