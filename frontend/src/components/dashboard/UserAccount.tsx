import React from 'react';
import {LeagueWithPortfolio} from "../../pages/Dashboard.tsx";
import {Player} from "./Portfolio.tsx";
import styled from "styled-components";
import {formatCurrency} from "../../utils/CurrencyFormatter.tsx";

interface UserAccountProps {
    currentLeague: LeagueWithPortfolio;
}

const Overall = styled.div`
    margin-top: 25px;
`;

const ChangesContainer = styled.div`
    display: flex;
    justify-content: space-between; // Adjusts the spacing between children elements
    align-items: center; // Aligns items vertically
    padding-right: 52px;
    padding-top: 0;
`;

const ChangesColumn1 = styled.div`
    display: flex;
    justify-content: space-between; // Adjusts the spacing between children elements
    flex-direction: column;
    align-items: flex-start; // Aligns items vertically
`;

const ChangesColumn2 = styled.div`
    display: flex;
    justify-content: space-between; // Adjusts the spacing between children elements
    flex-direction: column;
    align-items: flex-start; // Aligns items vertically
`;

const BalancePortfolioContainer = styled.div`
    display: flex;
    justify-content: space-between; // Adjusts the spacing between children elements
    align-items: center; // Aligns items vertically
    padding-right: 52px;
    padding-top: 0;
`;

const BPColumn1 = styled.div`
    display: flex;
    justify-content: space-between; // Adjusts the spacing between children elements
    flex-direction: column;
    align-items: flex-start; // Aligns items vertically
`;

const BPColumn2 = styled.div`
    display: flex;
    justify-content: space-between; // Adjusts the spacing between children elements
    flex-direction: column;
    align-items: flex-start; // Aligns items vertically
`;


const ValueLabel = styled.p`
    margin-top: 15px; // Reduces the space below the paragraph
    margin-bottom: 0;
    font-size: 14px; // Set the size as needed
    color: #EAEAEA;
`;

const AccountValue = styled.h2`
    margin: 0; // Reduces the space above the heading
    font-size: 40px; // Increase font size as needed
    color: #EAEAEA;
`;

const ChangeValue = styled.h2`
    // Reduces the space above the heading
    margin: 0;
    font-size: 20px; // Increase font size as needed
    color: #EAEAEA;

`;



export const UserAccount: React.FC<UserAccountProps> = ({ currentLeague}) => {
    const calculateTotalPortfolioValue = (players: { [key: string]: Player }): number => {
        return Object.values(players).reduce((total, player) => {
            return total + (player.shares * player.current_price);
        }, 0);
    };

    const balance = currentLeague.balance;
    const portfolioTotal = calculateTotalPortfolioValue(currentLeague.portfolio.players);
    const accountTotal = balance + portfolioTotal;
    const change24Hours = currentLeague.one_day_change;
    const change3Days = currentLeague.three_day_change;

    return (
        <Overall>
            <ValueLabel>Account Value: </ValueLabel>
            <AccountValue>{formatCurrency(accountTotal, 2)}</AccountValue>
            <ChangesContainer>
                <ChangesColumn1>
                    <ValueLabel>1-Day Change:</ValueLabel>
                    <ChangeValue>{formatCurrency(change24Hours, 1)}</ChangeValue>
                </ChangesColumn1>
                <ChangesColumn2>
                    <ValueLabel>3-Day Change:</ValueLabel>
                    <ChangeValue>{formatCurrency(change3Days, 1)}</ChangeValue>
                </ChangesColumn2>
            </ChangesContainer>
            <BalancePortfolioContainer>
                <BPColumn1>
                    <ValueLabel>Balance:</ValueLabel>
                    <ChangeValue>{formatCurrency(balance, 2)}</ChangeValue>
                </BPColumn1>
                <BPColumn2>
                    <ValueLabel>Portfolio:</ValueLabel>
                    <ChangeValue>{formatCurrency(portfolioTotal, 2)}</ChangeValue>
                </BPColumn2>
            </BalancePortfolioContainer>
        </Overall>
    );
};

