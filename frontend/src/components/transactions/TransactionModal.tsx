import styled from "styled-components";
import { formatCurrency } from "../../utils/CurrencyFormatter.tsx";

interface ModalProps {
  children: React.ReactNode;  // Type for anything that can be rendered: numbers, strings, elements or an array (or fragment)
  onClose: () => void;        // Type for a function that doesn't take or return anything (void)
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: string;
  shares: number;
  gameName: string;
  price: number;
  balance: number;
  onConfirm: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #222;
  height: 410px;
  width: 300px;
  padding: 10px 0px 10px 25px;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  align-items: center;
`;

const CloseButton = styled.button`
  float: right;
  background: none;
  border: none;
  font-size: 1.5em;
  color: #EAEAEA;
`;

const TransactionModal: React.FC<ModalProps> = ({ children, onClose }) => {
  const handleOverlayClick = (event: React.MouseEvent) => {
    // Checks if the event is directly on the overlay
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {children}
      </ModalContent>
    </Overlay>
  );
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  transactionType,
  shares,
  price,
  gameName,
  balance,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const calculateNewBalance = () => {
    const totalCost = price * shares;
    if (transactionType.toLowerCase() === 'buy') {
      return balance - totalCost;
    } else if (transactionType.toLowerCase() === 'sell') {
      return balance + totalCost;
    }
    return balance; // Return the current balance if transactionType is neither buy nor sell
  };

  return (
    <TransactionModal onClose={onClose}>
      <h2>Transaction</h2>
      <p>Type: {transactionType.toUpperCase()} </p>
      <p>Player: {gameName} </p>
      <p>Shares: {shares}</p>
      <p>Price: ${price.toFixed(2)}</p>
      <p>Total: ${(price * shares).toFixed(2)}</p>
      <h3>New Balance: {formatCurrency(calculateNewBalance(), 1)}</h3>
      <br/>
      <button onClick={onConfirm} className="buttonStyle">Confirm</button>
    </TransactionModal>
  );
};
