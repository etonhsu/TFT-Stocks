import styled from "styled-components";
import {ReactNode} from "react";

interface TransactionDetailsProps {
  label: string;
  children: ReactNode; // If you only expect elements, use ReactElement instead
}



const TransactionDetailsWrapper = styled.div`
    position: relative; // This will allow you to absolutely position the label
    margin-top: 2%;
    margin-right: 30%;
    width: 330px;
    height: 237px;
    border: 3px solid #666;
    border-radius: 10px;
`;

const TransactionDetailsLabel = styled.span`
  position: absolute;
  top: -20px; // Adjust as necessary to move the label above the container
  left: 10px; // Adjust as necessary to align the label with the container's border
  background: #222; // Match the background of the site to cover the container's border
  padding: 0 5px;
  font-size: 24px; // Adjust as necessary
  color: #EAEAEA; // Label text color
`;

const TransactionDetails = styled.div`
    height: 60px;
    padding: 25px 20px 20px;
    justify-content: center;
    justify-items: center;
`;

export const TransactionContainer: React.FC<TransactionDetailsProps> = ({ label, children }) => {
  return (
    <TransactionDetailsWrapper>
      <TransactionDetailsLabel>{label}</TransactionDetailsLabel>
      <TransactionDetails>{children}</TransactionDetails>
    </TransactionDetailsWrapper>
  );
};