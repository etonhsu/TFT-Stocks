import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface PlayerDetailsProps {
  label: string;
  children: ReactNode; // If you only expect elements, use ReactElement instead
}

const PlayerDetailsWrapper = styled.div`
  position: relative; // This will allow you to absolutely position the label
  margin-bottom: 1.5%; // Space after the container
`;

const PlayerDetailsLabel = styled.span`
  position: absolute;
  top: -20px; // Adjust as necessary to move the label above the container
  left: 70px; // Adjust as necessary to align the label with the container's border
  background: #222; // Match the background of the site to cover the container's border
  padding: 0 5px;
  font-size: 24px; // Adjust as necessary
  color: #EAEAEA; // Label text color
`;

const PlayerDetails = styled.div`
    height: auto;
    min-height: 330px;
    width: 71vw;
    border: 3px solid #666;
    border-radius: 10px;
    margin: 20px 50px 20px;
    padding: 20px;
    display: flex;
    flex-direction: row; // Arrange children in a row
    gap: 20px; // Space between children
`;

export const PlayerDetailsContainer: React.FC<PlayerDetailsProps> = ({ label, children }) => {
  return (
    <PlayerDetailsWrapper>
      <PlayerDetailsLabel>{label}</PlayerDetailsLabel>
      <PlayerDetails>{children}</PlayerDetails>
    </PlayerDetailsWrapper>
  );
};
