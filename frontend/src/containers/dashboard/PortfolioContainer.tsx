import styled from "styled-components";
import {ReactNode} from "react";

interface PortfolioDetailsProps {
  label: string;
  children: ReactNode; // If you only expect elements, use ReactElement instead
}

const PortfolioDetailsWrapper = styled.div`
    position: relative; // This will allow you to absolutely position the label
    margin: 3.5% 3% 8px 1%;
    flex: 1; // Takes up all available space
`;

const PortfolioDetailsLabel = styled.span`
  position: absolute;
  top: -20px; // Adjust as necessary to move the label above the container
  left: 10px; // Adjust as necessary to align the label with the container's border
  background: #222; // Match the background of the site to cover the container's border
  padding: 0 5px;
  font-size: 24px; // Adjust as necessary
  color: #EAEAEA; // Label text color
`;

const PortfolioDetails = styled.div`
    flex: 1;  // Takes up all available space
    padding-bottom: 20px;
    background-color: #222; // Light background for the Portfolio area
    display: flex;
    justify-content: flex-start; // Aligns the Portfolio to the right
    //border-top: 3px solid #666;
    //border-radius: 10px;
`;

export const PortfolioContainer: React.FC<PortfolioDetailsProps> = ({ label, children }) => {
  return (
    <PortfolioDetailsWrapper>
      <PortfolioDetailsLabel>{label}</PortfolioDetailsLabel>
      <PortfolioDetails>{children}</PortfolioDetails>
    </PortfolioDetailsWrapper>
  );
};