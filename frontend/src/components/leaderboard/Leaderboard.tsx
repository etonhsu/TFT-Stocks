import React from 'react';
import { UserLink } from '../user/UserLink.tsx';
import { LeaderboardEntry } from '../../services/LeaderboardAPI.ts';
import { StyledPlayerLink } from "../../containers/multiUse/LinkStyle.ts";
import {ClickStyledHeader, StyledCell, StyledHeader, StyledRow, StyledTable } from "../../containers/multiUse/TableStyle.tsx";
import styled from "styled-components";
import {formatCurrency} from "../../utils/CurrencyFormatter.tsx";
import {FaSort, FaSortDown, FaSortUp} from "react-icons/fa";

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    type: string;
    onSortChange: (sortType: string) => void;
}

const LeaderboardContainer = styled.div`
    position: relative; // This will allow you to absolutely position the label
    margin-left: 3%;
    margin-right: 5%;
    flex: 1;  // Takes up all available space
`;

const IconContainer = styled.div`
    position: relative; // This will allow you to absolutely position the label
    margin-left: 10px;
    margin-top: 1.5px;
    
`;

const DeltaHeader = styled.div`
  display: flex;
  align-items: flex-start;
`;

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, type, onSortChange }) => {
    if (!entries || !Array.isArray(entries)) {
        console.log('Entries are not loaded or not an array:', entries);
        return <p>No leaderboard data available or still loading...</p>;
    }

    if (entries.length === 0) {
        return <p>No entries to display.</p>;
    }

    const handleHeaderClick = (attribute: string) => {
        if (attribute === 'lp') {
            onSortChange('lp');
            return;
        }
        // Build the base attribute name by removing any prefix
        const baseAttribute = attribute.replace('delta_', '').replace('neg_', '');
        // Determine the new attribute by checking the current prefix
        const newType = type.includes(`delta_${baseAttribute}`) ? `neg_${baseAttribute}` : `delta_${baseAttribute}`;
        onSortChange(newType);
    };

    const renderArrowIcon = (attribute: string) => {
        // Extract the base attribute by removing any prefix
        const baseAttribute = attribute.replace('delta_', '').replace('neg_', '');

        // Determine if the current column is the one being sorted
        const currentSortBase = type.replace('delta_', '').replace('neg_', '');

        if (currentSortBase === baseAttribute) {
            // Check the current type state to decide which icon to render
            const isNegative = type.startsWith('neg_');
            return isNegative ? <FaSortUp /> : <FaSortDown />;
        }

        // Default to unsorted icon
        return <FaSort />;
    };

    return (
        <div className="leaderboard">
            <LeaderboardContainer>
                <StyledTable>
                    <thead>
                        <tr>
                            <StyledHeader>Rank</StyledHeader>
                            <StyledHeader>Player</StyledHeader>
                            <ClickStyledHeader onClick={() => handleHeaderClick('lp')}>
                                <DeltaHeader>
                                Price
                                    <IconContainer>
                                        <FaSortDown/>
                                    </IconContainer>
                                </DeltaHeader>
                            </ClickStyledHeader>
                            <ClickStyledHeader onClick={() => handleHeaderClick('delta_8h')}>
                                <DeltaHeader>
                                8-Hour Change
                                    <IconContainer>
                                        {renderArrowIcon('8h')}
                                    </IconContainer>
                                </DeltaHeader>
                            </ClickStyledHeader>
                            <ClickStyledHeader onClick={() => handleHeaderClick('delta_24h')}>
                                <DeltaHeader>
                                1-Day Change
                                    <IconContainer>
                                        {renderArrowIcon('24h')}
                                    </IconContainer>
                                </DeltaHeader>
                            </ClickStyledHeader>
                            <ClickStyledHeader onClick={() => handleHeaderClick('delta_72h')}>
                                <DeltaHeader>
                                3-Day Change
                                    <IconContainer>
                                        {renderArrowIcon('72h')}
                                    </IconContainer>
                                </DeltaHeader>
                            </ClickStyledHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <StyledRow key={index}>
                                <StyledCell>{entry.rank}</StyledCell>
                                <StyledCell>
                                    {type === 'portfolio' ? (
                                        <UserLink gameName={entry.gameName} />
                                    ) : (
                                        <StyledPlayerLink gameName={entry.gameName} tagLine = {entry.tagLine} />
                                    )}
                                </StyledCell>
                                <StyledCell>{formatCurrency(entry.lp, 2)}</StyledCell>
                                <StyledCell>{formatCurrency(entry.delta_8h, 1)}</StyledCell>
                                <StyledCell>{formatCurrency(entry.delta_24h, 1)}</StyledCell>
                                <StyledCell>{formatCurrency(entry.delta_72h, 1)}</StyledCell>
                            </StyledRow>
                        ))}
                    </tbody>
                </StyledTable>
            </LeaderboardContainer>
        </div>
    );
};