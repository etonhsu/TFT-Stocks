import styled from "styled-components";
import {ReactNode} from "react";


interface UserTransactionsProps {
  label: string;
  children: ReactNode; // If you only expect elements, use ReactElement instead
}

const UserTransactionsWrapper = styled.div`
    margin-top: 10px;
    position: relative; // This will allow you to absolutely position the label
`;

const UserTransactionsLabel = styled.span`
  position: absolute;
  top: -20px; // Adjust as necessary to move the label above the container
  left: 10px; // Adjust as necessary to align the label with the container's border
  background: #222; // Match the background of the site to cover the container's border
  padding: 0 5px;
  font-size: 24px; // Adjust as necessary
  color: #EAEAEA; // Label text color
`;

const UserTransactions = styled.div`
    height: 330px;
    min-width: 300px;
    border: 3px solid #666;
    border-radius: 10px;
    align-content: center;  // Centers text vertically
    justify-content: center;  // Centers text horizontally
    text-align: left;
    padding-left: 15px;
`;

export const UserTransactionsContainer: React.FC<UserTransactionsProps> = ({ label, children }) => {
  return (
    <UserTransactionsWrapper>
      <UserTransactionsLabel>{label}</UserTransactionsLabel>
      <UserTransactions>{children}</UserTransactions>
    </UserTransactionsWrapper>
  );
};