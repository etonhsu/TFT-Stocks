import { useState, useEffect } from "react";
import axios from 'axios';
import styled from "styled-components";
import { PreviewModal } from "./TransactionModal.tsx";
import { useAuth } from "../../utils/Authentication.tsx";

const TransactionForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  margin: 10px 0;
`;

const FieldWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const TransactionSelect = styled.select`
  padding: 10px 10px 10px 4px;
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  width: 206px;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SharesDisplay = styled.div`
  display: flex;
  padding: 6px 10px 2px 4px;
  border: 1px solid #EAEAEA;
  background-color: black;
  border-radius: 4px;
  width: 40px;
  height: 27px;
  text-align: center;
  justify-content: center;
  color: #EAEAEA;
`;

const PercentageDisplay = styled.div`
  display: flex;
  padding: 6px 10px 2px 4px;
  border: 1px solid #EAEAEA;
  background-color: black;
  border-radius: 4px;
  width: 125px;
  height: 27px;
  text-align: center;
  justify-content: center;
  color: #EAEAEA;
`;

const SharesSlider = styled.input`
  flex-grow: 1;
  cursor: pointer;
`;

const TransactionButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #646cff;
  color: #EAEAEA;
  border-radius: 4px;
  cursor: pointer;
  width: 150px;
  align-items: center;
  margin-top: 10px;

  &:hover {
    background-color: #535bf2;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export interface UserData {
  gameName: string;
  tagLine: string;
  shares: number;
}

interface Hold {
  gameName: string;
  tagLine: string;
  shares: number;
  hold_deadline: string;
}

interface League {
  league: {
    id: number;
  };
  balance: number;
  portfolio: {
    players: {
      [key: string]: {
        shares: number;
        holds?: Hold[];
      };
    };
  };
}


interface TransactionComponentProps {
  gameName: string;
  tagLine: string;
  updateUserData: (data: UserData) => void;
}

export const TransactionComponent: React.FC<TransactionComponentProps> = ({ gameName, tagLine, updateUserData }) => {
  const [shares, setShares] = useState<string>('0');
  const [price, setPrice] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [currentShares, setCurrentShares] = useState<number>(0);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [transactionType, setTransactionType] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useAuth();
  const { isLoggedIn } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPrice = async () => {
      if (gameName && tagLine) {
        try {
          const response = await fetch(`${backendUrl}/players/${gameName}/${tagLine}`);
          const data = await response.json();
          if (response.ok) {
            setPrice(data.price[data.price.length - 1]);
          } else {
            throw new Error(data.detail || 'Failed to fetch price data');
          }
        } catch (error) {
          setError('Failed to fetch price');
        }
      }
    };
    fetchPrice();
  }, [backendUrl, gameName, tagLine]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (isLoggedIn) {
        try {
          const response = await axios.get(`${backendUrl}/dashboard`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const userSummary = response.data;
          const currentLeague = userSummary.leagues.find((league: League) => league.league.id === userSummary.current_league_id);

          if (currentLeague) {
            setUserBalance(currentLeague.balance);

            const playersData = currentLeague.portfolio.players;
            if (playersData && playersData[gameName]) {
              const playerShares = playersData[gameName].shares;
              setCurrentShares(playerShares);
              setHolds(playersData[gameName].holds || []);
            } else {
              throw new Error(`Player data not found for ${gameName} with tagLine ${tagLine}`);
            }
          } else {
            throw new Error('Current league not found');
          }

          setLoading(false);
        } catch (error) {
          console.error('Error fetching data: ', error);
          setLoading(false);
        }
      }
    };
    fetchUserBalance();
  }, [backendUrl, gameName, tagLine, isLoggedIn, token]);

  const handleTransaction = async () => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/players/${gameName}/${tagLine}/${transactionType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shares })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Transaction failed');
      updateUserData(data);
      setError('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = () => {
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }
    return null;
  };

  const renderHoldMessage = () => {
    const activeHolds = holds.filter(hold => new Date(hold.hold_deadline) > new Date());
    if (activeHolds.length > 0) {
      return (
        <div>
          {activeHolds.map((hold, index) => (
            <p key={index} style={{ color: 'orange' }}>
              {`${hold.shares} shares of ${hold.gameName} on hold until ${new Date(hold.hold_deadline).toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!gameName || !tagLine) {
    return <div>Error: Game name or tag line is missing.</div>;
  }

  const handlePreview = () => {
    if (transactionType && shares !== '0') {
      setIsModalOpen(true);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShares(e.target.value);
  };

  const calculateMaxShares = () => {
    switch (transactionType) {
      case 'buy':
        return Math.floor(userBalance / price);
      case 'sell': {
        const totalHolds = holds.reduce((sum, hold) => sum + hold.shares, 0);
        return currentShares - totalHolds;
      }
      default:
        return 100;
    }
  };

  return (
    <>
      <TransactionForm onSubmit={(e) => e.preventDefault()}>
        <FieldWrapper>
          <label htmlFor="actionSelect">Action:</label>
          <TransactionSelect
            id="actionSelect"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            disabled={loading}
          >
            <option value="">Select</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </TransactionSelect>
        </FieldWrapper>
        <FieldWrapper>
          <label htmlFor="sharesInput">Quantity:</label>
          <SliderContainer>
            <SharesDisplay>
              {shares}
            </SharesDisplay>
            <PercentageDisplay>
              {transactionType === 'buy' ?
                `% ${(price * parseInt(shares, 10) / userBalance * 100).toFixed(2)} Balance`
                : transactionType === 'sell' ?
                  `+ $${((parseInt(shares) * price)).toFixed(2)}`
                  : ''}
            </PercentageDisplay>
          </SliderContainer>
        </FieldWrapper>
        <SharesSlider
          id="sharesSlider"
          type="range"
          min="0"
          max={calculateMaxShares()}
          value={shares}
          onChange={handleSliderChange}
        />
        <TransactionButton onClick={handlePreview} disabled={loading || !transactionType || shares === '0'}>
          Preview
        </TransactionButton>
        {renderError()}
        {renderHoldMessage()}
      </TransactionForm>
      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionType={transactionType}
        price={price}
        shares={Number(shares)}
        gameName={gameName}
        balance={userBalance}
        onConfirm={handleTransaction}
      />
    </>
  );
};
