import styled from "styled-components";
import {ReactNode} from "react";


export const PlayerNameContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

export const FavoritesIconContainer = styled.div`
    margin-top: 47px;
    margin-left: 10px;
`;

export const PlayerInfoContainer = styled.div`
  display: flex;
  align-items: flex-start;
`;

export const DetailsAndTransactionColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px; // Adds space between containers
    margin-top: 1%;
    margin-left: 1%;
`;

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
  left: 10px; // Adjust as necessary to align the label with the container's border
  background: #222; // Match the background of the site to cover the container's border
  padding: 0 5px;
  font-size: 24px; // Adjust as necessary
  color: #EAEAEA; // Label text color
`;

const PlayerDetails = styled.div`
    height: 220px;
    min-width: 300px;
    border: 3px solid #666;
    border-radius: 10px;
    padding-left: 20px;
    padding-top: 5px;
`;

export const PlayerDetailsContainer: React.FC<PlayerDetailsProps> = ({ label, children }) => {
  return (
    <PlayerDetailsWrapper>
      <PlayerDetailsLabel>{label}</PlayerDetailsLabel>
      <PlayerDetails>{children}</PlayerDetails>
    </PlayerDetailsWrapper>
  );
};
