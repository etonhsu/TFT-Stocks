import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Portfolio, Player } from '../components/dashboard/Portfolio.tsx';
import { Transaction } from '../components/transactions/RecentTransactions.tsx';
import { UserTransactionsContainer } from "../containers/user/UserTransactionsContainer.tsx";
import { MainContent } from "../containers/general/MainContent.tsx";
import { Text } from "../containers/dashboard/TextStyle.tsx";
import styled from "styled-components";
import { UserChart } from "../components/user/UserChart.tsx";
import { PortfolioContainer } from "../containers/dashboard/PortfolioContainer.tsx";
import { PortfolioHistoryData } from "./Dashboard.tsx";
import {
    UserAccountColumn,
    UserAccountContainer,
    UserAccountDetailsContainer
} from "../containers/user/UserContainer.tsx";
import { formatCurrency } from "../utils/CurrencyFormatter.tsx";

// Define interfaces for the expected data structures
interface User {
    username: string;
    portfolio?: {
        players: { [key: string]: Player; }; // Define the player type based on your data structure
    };
    transactions: Transaction[]; // Define the Transaction type based on your data structure
    portfolio_history: PortfolioHistoryData[];
    rank: number;
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
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch(`${backendUrl}/users/${username}`);
                const data = await response.json();
                if (response.ok) {
                    setUser(data);
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

    const total = user && user.portfolio_history.length > 0 ? user.portfolio_history[user.portfolio_history.length - 1].value : undefined;

    if (loading) {
        return (<MainContent className="mainContentContainer">Loading...</MainContent>);
    }
    if (error) {
        return (<MainContent className="mainContentContainer">Error: No data available.</MainContent>);
    }
    if (!user) return <MainContent className="mainContentContainer">No user data available.</MainContent>;

    return (
        <MainContent>
            <TextContainer>
                <Text size="52px" weight="bold" color='#EAEAEA' padding='10px 5px 0px 5px'>{user.username}</Text>
                <Text size="22px" weight="bold" color='#EAEAEA' padding='0 0 10px 7px'>
                    {user.rank === 0 ? 'Rank n/a' : `Rank #${user.rank}`}
                </Text>
            </TextContainer>
            <UserAccountContainer>
                <UserAccountColumn>
                    <UserAccountDetailsContainer label={"Overview"}>
                        <ValueLabel>Account Value: </ValueLabel>
                        <AccountValue>{total != undefined ? formatCurrency(total, 2) : 'N/A'}</AccountValue>
                    </UserAccountDetailsContainer>
                    <UserTransactionsContainer label={"Recent Transactions"}>
                        {user.transactions.slice().reverse().slice(0, 7).map((transaction, index) => (
                            <div key={index}>
                                <p>{transaction.type} | {transaction.gameName} | {transaction.shares} Shares</p>
                            </div>
                        ))}
                    </UserTransactionsContainer>
                </UserAccountColumn>
                <UserChart portfolioHistory={user.portfolio_history} />
            </UserAccountContainer>
            <PortfolioContainer label={'Portfolio'}>
                {user.portfolio?.players && <Portfolio players={user.portfolio.players} />}
            </PortfolioContainer>
        </MainContent>
    );
}
