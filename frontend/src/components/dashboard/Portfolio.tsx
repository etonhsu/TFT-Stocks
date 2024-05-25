import styled from "styled-components";
import React, { useState } from "react";
import { StyledRow, StyledTable } from "../../containers/multiUse/TableStyle";
import { StyledPlayerLink } from "../../containers/multiUse/LinkStyle";
import { formatCurrency } from "../../utils/CurrencyFormatter";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

export interface Hold {
    gameName: string;
    shares: number;
    hold_deadline: string;
}

export interface Player {
    shares: number;
    purchase_price: number;
    current_price: number;
    tagLine: string; // Include tagLine in Player interface
}

interface PortfolioProps {
    players: { [key: string]: Player };
    holds?: Hold[]; // Make holds optional
}

export const PortfolioHeader = styled.th`
    background-color: #222;
    padding: 25px 10px 10px;
    border: 1px solid #cccccc;
    text-align: left;
    cursor: pointer;
    justify-content: space-between;
    align-items: center;
`;

export const PortfolioStyledCell = styled.td`
    padding: 8px;
    border: 1px solid #666;
    text-align: left;
    align-items: flex-start;
    height: 40px;
`;

const ValueCell = styled.div`
  display: flex;
  align-items: flex-start;
`;

const IndentedLine = styled.div`
  padding-left: 8px;
`;

// Helper function to convert UTC datetime string to local time
const convertUTCToLocal = (utcString: string) => {
    // Add 'Z' at the end if the string doesn't have timezone info
    if (!utcString.endsWith('Z') && !utcString.includes('+')) {
        utcString += 'Z';
    }
    const utcDate = new Date(utcString);
    return utcDate.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const Portfolio: React.FC<PortfolioProps> = ({ players, holds }) => {
    const [sortKey, setSortKey] = useState<string>('name');
    const [isAscending, setIsAscending] = useState<boolean>(true);

    if (!players || typeof players !== 'object' || Object.keys(players).length === 0) {
        return <p>No player data available or still loading...</p>;
    }

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setIsAscending(!isAscending);
        } else {
            setSortKey(key);
            setIsAscending(true);
        }
    };

    const renderSortIcon = (column: string) => {
        if (sortKey !== column) return <FaSort />;
        return isAscending ? <FaSortDown /> : <FaSortUp />;
    };

    const sortedPlayers = Object.entries(players).sort(([name1, player1], [name2, player2]) => {
        let value1, value2;
        switch (sortKey) {
            case 'gain_loss':
                value1 = (player1.current_price - player1.purchase_price);
                value2 = (player2.current_price - player2.purchase_price);
                break;
            case 'total_value':
                value1 = player1.current_price * player1.shares;
                value2 = player2.current_price * player2.shares;
                break;
            case 'current_price':
            case 'purchase_price':
                value1 = player1[sortKey];
                value2 = player2[sortKey];
                break;
            case 'name':
            default:
                value1 = name1;
                value2 = name2;
                break;
        }

        if (value1 < value2) return isAscending ? -1 : 1;
        if (value1 > value2) return isAscending ? 1 : -1;
        return 0;
    });

    const renderHoldInfo = (gameName: string) => {
        if (!holds) return null;
        const playerHolds = holds.filter(hold => hold.gameName === gameName);
        if (playerHolds.length === 0) {
            return "No holds";
        }

        return playerHolds.map((hold, index) => (
            <div key={index}>
                {`${hold.shares} shares: ${convertUTCToLocal(hold.hold_deadline)}`}
            </div>
        ));
    };

    return (
        <StyledTable>
            <thead>
                <tr>
                    <PortfolioHeader onClick={() => handleSort('name')}>
                        Name {renderSortIcon('name')}
                    </PortfolioHeader>
                    <PortfolioHeader onClick={() => handleSort('shares')}>
                        Shares {renderSortIcon('shares')}
                    </PortfolioHeader>
                    <PortfolioHeader onClick={() => handleSort('current_price')}>
                        Current Price {renderSortIcon('current_price')}
                    </PortfolioHeader>
                    <PortfolioHeader onClick={() => handleSort('purchase_price')}>
                        Purchase Price {renderSortIcon('purchase_price')}
                    </PortfolioHeader>
                    <PortfolioHeader onClick={() => handleSort('gain_loss')}>
                        Gain/Loss {renderSortIcon('gain_loss')}
                    </PortfolioHeader>
                    <PortfolioHeader onClick={() => handleSort('total_value')}>
                        Total Value (Gain/Loss) {renderSortIcon('total_value')}
                    </PortfolioHeader>
                    {holds && (
                        <PortfolioHeader>
                            Holds
                        </PortfolioHeader>
                    )}
                </tr>
            </thead>
            <tbody>
                {sortedPlayers.map(([name, player]) => (
                    <StyledRow key={name}>
                        <PortfolioStyledCell>
                            <StyledPlayerLink gameName={name} tagLine={player.tagLine} /> {/* Pass tagLine */}
                        </PortfolioStyledCell>
                        <PortfolioStyledCell>{player.shares}</PortfolioStyledCell>
                        <PortfolioStyledCell>{formatCurrency(player.current_price, 2)}</PortfolioStyledCell>
                        <PortfolioStyledCell>{formatCurrency(player.purchase_price, 2)}</PortfolioStyledCell>
                        <PortfolioStyledCell>{formatCurrency(player.current_price - player.purchase_price, 1)}</PortfolioStyledCell>
                        <PortfolioStyledCell>
                            <ValueCell>
                                ${(player.current_price * player.shares).toFixed(2)}
                                <IndentedLine>
                                    ({formatCurrency((player.current_price - player.purchase_price) * player.shares, 1)})
                                </IndentedLine>
                            </ValueCell>
                        </PortfolioStyledCell>
                        {holds && (
                            <PortfolioStyledCell>
                                {renderHoldInfo(name)}
                            </PortfolioStyledCell>
                        )}
                    </StyledRow>
                ))}
            </tbody>
        </StyledTable>
    );
};
