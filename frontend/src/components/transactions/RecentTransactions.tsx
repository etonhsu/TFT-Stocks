import {StyledCell, StyledHeader, StyledRow, StyledTable} from "../../containers/multiUse/TableStyle.tsx";
import styled from "styled-components";
import {StyledPlayerLink} from "../../containers/multiUse/LinkStyle.ts";
import {formatCurrency} from "../../utils/CurrencyFormatter.tsx";
import {formatDate} from "../../utils/DateFormatter.tsx";

// Define the structure of a transaction object
export interface Transaction {
    type: string;
    gameName: string;
    tagLine: string;
    shares: number;
    price: number;
    transaction_date: string; // Assuming transaction_date is a string of date
}

// Define the props for the RecentTransactions component
interface RecentTransactionsProps {
    transactions: Transaction[];
    maxEntries: number
}

const TransactionContainer = styled.div`
    position: relative; // This will allow you to absolutely position the label
    margin-left: 3%;
    margin-right: 5%;
    flex: 1;  // Takes up all available space
`;

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, maxEntries }) => {
  if (!transactions || !Array.isArray(transactions)) {
    return <p>No transactions available or still loading...</p>;
  }

  // Create a copy of the transactions array and reverse it
  const reversedTransactions = [...transactions].reverse().slice(0,maxEntries);

  return (
      <TransactionContainer>
        <StyledTable>
          <thead>
            <tr>
              <StyledHeader>Type</StyledHeader>
              <StyledHeader>Name</StyledHeader>
              <StyledHeader>Shares</StyledHeader>
              <StyledHeader>Price</StyledHeader>
              <StyledHeader>Date</StyledHeader>
            </tr>
          </thead>
          <tbody>
            {reversedTransactions.map((transaction, index) => (
              <StyledRow key={index}>
                <StyledCell>{transaction.type}</StyledCell>
                <StyledCell><StyledPlayerLink gameName={transaction.gameName} tagLine={transaction.tagLine}/></StyledCell>
                <StyledCell>{transaction.shares}</StyledCell>
                <StyledCell>{formatCurrency(transaction.price, 2)}</StyledCell>
                <StyledCell>{formatDate(transaction.transaction_date)}</StyledCell>
              </StyledRow>
            ))}
          </tbody>
        </StyledTable>
      </TransactionContainer>
  );
};
