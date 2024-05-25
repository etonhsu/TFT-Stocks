import styled from "styled-components";
import {ReactNode} from "react";

export const AccountContainer = styled.div`
  display: flex;
  align-items: flex-start;
    padding-bottom: 8px;
`;


export const AccountColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px; // Adds space between containers
    margin-top: 1%;
    margin-left: 1%;
`;

interface AccountDetailsProps {
  label: string;
  children: ReactNode; // If you only expect elements, use ReactElement instead
}

const AccountDetailsWrapper = styled.div`
    position: relative; // This will allow you to absolutely position the label
    margin-bottom: 1.5%; // Space after the container
`;

const AccountDetailsLabel = styled.span`
  position: absolute;
  top: -20px; // Adjust as necessary to move the label above the container
  left: 10px; // Adjust as necessary to align the label with the container's border
  background: #222; // Match the background of the site to cover the container's border
  padding: 0 5px;
  font-size: 24px; // Adjust as necessary
  color: #EAEAEA; // Label text color
`;

const AccountDetails = styled.div`
    height: 275px;
    min-width: 300px;
    border: 3px solid #666;
    border-radius: 10px;
    padding-left: 25px;
    
    
`;

export const AccountDetailsContainer: React.FC<AccountDetailsProps> = ({ label, children }) => {
  return (
    <AccountDetailsWrapper>
      <AccountDetailsLabel>{label}</AccountDetailsLabel>
      <AccountDetails>{children}</AccountDetails>
    </AccountDetailsWrapper>
  );
};