import React from 'react';
import styled from "styled-components";
import {PortfolioLeaderboardEntry} from "../../services/LeaderboardAPI.ts";
import {StyledUserLink} from "../../containers/multiUse/LinkStyle.ts";
import { StyledCell, StyledHeader, StyledRow, StyledTable } from "../../containers/multiUse/TableStyle.tsx";
import {formatCurrency} from "../../utils/CurrencyFormatter.tsx";

interface PortfolioLeaderboardProps {
    entries: PortfolioLeaderboardEntry[];
}

const PortfolioLeaderboardContainer = styled.div`
    position: relative;
    margin-left: 3%;
    margin-right: 5%;
    flex: 1;
`;

export const PortfolioLeaderboard: React.FC<PortfolioLeaderboardProps> = ({ entries }) => {
    if (!entries || !Array.isArray(entries)) {
        console.log('Entries are not loaded or not an array:', entries);
        return <p>No portfolio data available or still loading...</p>;
    }

    if (entries.length === 0) {
        return <p>No portfolio entries to display.</p>;
    }

    return (
        <div className="portfolio-leaderboard">
            <PortfolioLeaderboardContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <StyledHeader>Rank</StyledHeader>
                            <StyledHeader>Username</StyledHeader>
                            <StyledHeader>Value</StyledHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <StyledRow key={index}>
                                <StyledCell>{entry.rank}</StyledCell>
                                <StyledCell>
                                    <StyledUserLink gameName={entry.username} />
                                </StyledCell>
                                <StyledCell>{formatCurrency(entry.value, 2)}</StyledCell>
                            </StyledRow>
                        ))}
                    </tbody>
                </StyledTable>
            </PortfolioLeaderboardContainer>
        </div>
    );
};
