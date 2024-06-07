import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MainContent } from "../containers/general/MainContent.tsx";
import styled from "styled-components";
import { PlayerDetailsContainer } from '../containers/ffs/PlayerContainer';
import { RegionalsChart } from "../components/ffs/RegionalsChart.tsx";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ModalOverlay, ModalContent } from '../containers/multiUse/StyledComponents.tsx';

interface Player {
  id: number;
  game_name: string;
  tag_line: string;
}

interface PlayerStats {
  name: string;
  price: number[];
  date: string[];
  date_updated: string;
  "8 Hour Change": number;
  "24 Hour Change": number;
  "3 Day Change": number;
  delist_date: string | null;
}

interface RankingItem {
  player: Player | null;
}

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 10px;
  margin: 10px 49px 50px 50px;
`;

const DraggablePlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border: 3px solid #666;
  border-radius: 10px;
  background-color: #222;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const TextContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  width: 400px;
`;

const DraggablePlayer: React.FC<{ player: Player, onClick: () => void }> = ({ player, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PLAYER',
    item: { id: player.id, source: 'list' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [player.id]);

  return (
    <DraggablePlayerContainer
      ref={drag}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {player.game_name} ({player.tag_line})
    </DraggablePlayerContainer>
  );
};

const RankingContainerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  margin-left: 50px;
  padding-bottom: 30px;
`;

const RankingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 450px;
`;

const RankingItemContainer = styled.div<{ borderColor: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border: 3px solid ${props => props.borderColor};
  border-radius: 10px;
  background-color: #222;
  cursor: pointer;
  position: relative;
  height: 35px;
  &:hover {
    text-decoration: underline;
  }
`;

const RankingNumber = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #EAEAEA;
`;

const DropTarget: React.FC<{ index: number, player: Player | null, movePlayer: (playerId: number, fromIndex: number | null, toIndex: number) => void, onClick: () => void }> = ({ index, player, movePlayer, onClick }) => {
  const [, drop] = useDrop(() => ({
    accept: 'PLAYER',
    drop: (item: { id: number, source: string, fromIndex?: number }) => {
      movePlayer(item.id, item.source === 'list' ? null : item.fromIndex!, index);
    },
  }), [index, player]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PLAYER',
    item: { id: player?.id, source: 'container', fromIndex: index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [index, player]);

  const getBorderColor = () => {
    switch (index) {
      case 0:
        return '#a28834';
      case 1:
        return '#9a9a9a';
      case 2:
        return '#986634';
      default:
        return '#666';
    }
  };

  return (
    <RankingItemContainer
      ref={(node) => drop(drag(node))}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      borderColor={getBorderColor()}
    >
      <RankingNumber>{index + 1}</RankingNumber>
      {player ? `${player.game_name} (${player.tag_line})` : 'Drop a player here'}
    </RankingItemContainer>
  );
};

const QuestionsContainer = styled.div`
  display: grid;
  grid-gap: 20px;
  width: 500px;
  margin-left: 50px;
`;

const Question = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuestionLabel = styled.label`
  margin-bottom: 10px;
  font-size: 16px;
  color: #EAEAEA;
`;

const QuestionInput = styled.input`
  padding: 8px;
  border: 1px solid #666;
  border-radius: 5px;
  background-color: #222;
  color: #EAEAEA;
`;

export const FFS: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>(Array(8).fill({ player: null }));
  const [isLoading, setLoading] = useState(true);
  const [isDetailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios.get<Player[]>(`${backendUrl}/ffs/players`)
      .then(response => {
        setPlayers(response.data);
        setLoading(false);
        if (response.data.length > 0) {
          fetchPlayerStats(response.data[0].game_name, response.data[0].tag_line);
        }
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
        setLoading(false);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Detailed Error:', error.response.data);
          console.error('Status code:', error.response.status);
          if (error.response.status === 500) {
            setError('Server error, please try again later.');
          } else {
            setError('Failed to fetch players.');
          }
        } else {
          setError('Failed to fetch players.');
        }
      });
  }, [backendUrl]);

  const fetchPlayerStats = (game_name: string, tag_line: string) => {
    setDetailLoading(true);
    axios.get<PlayerStats>(`${backendUrl}/ffs/players/${game_name}/${tag_line}`)
      .then(response => {
        setSelectedPlayer(response.data);
        setDetailLoading(false);
      })
      .catch(error => {
        console.error('Error fetching player stats: ', error);
        setDetailLoading(false);
        if (axios.isAxiosError(error) && error.response) {
          console.error('Detailed Error:', error.response.data);
          console.error('Status code:', error.response.status);
          if (error.response.status === 500) {
            setError('Server error, please try again later.');
          } else {
            setError('Failed to fetch player stats.');
          }
        } else {
          setError('Failed to fetch player stats.');
        }
      });
  };

  const movePlayer = (playerId: number, fromIndex: number | null, toIndex: number) => {
    console.log(`Moving player ${playerId} from ${fromIndex} to ${toIndex}`);
    const player = players.find(p => p.id === playerId) || ranking[fromIndex!]?.player;
    if (!player) return;

    setRanking(prevRanking => {
      const newRanking = [...prevRanking];

      if (fromIndex !== null) {
        if (toIndex === null) {
          // Move player from ranking to list
          newRanking[fromIndex] = { player: null };
        } else {
          // Swap players if there is a player at the toIndex
          const swappedPlayer = newRanking[toIndex].player;
          newRanking[toIndex] = { player };
          newRanking[fromIndex] = { player: swappedPlayer || null };
        }
      } else {
        if (newRanking[toIndex].player) {
          // Move player from list to occupied ranking slot
          setPlayers(prevPlayers => [...prevPlayers, newRanking[toIndex].player!]);
        }
        newRanking[toIndex] = { player };
      }

      console.log('Updated ranking:', newRanking);
      return newRanking;
    });

    if (fromIndex === null) {
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));
    }
  };

  if (isLoading) {
    return (<MainContent className="mainContentContainer">Loading...</MainContent>);
  }

  if (error) {
    return (<MainContent className="mainContentContainer">{error}</MainContent>);
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <MainContent>
        {isModalOpen && (
          <ModalOverlay>
            <ModalContent>
              <h2>Welcome to Future Sight</h2>
              <p>
                Select your top 8 in the upcoming Americas Golden Spatula tournament.
                Click on each player to see their accomplishments and ladder stats, and drag your top picks into your ranking; the points your picks
                earn during the tournament will add to your total. Your top 3 picks will also get a 1.3x, 1.2x, and 1.1x point multiplier!
                Before you submit, answer the bonus questions provided by Frodan, which will act as tiebreakers. Good luck!
              </p>
              <button onClick={() => setIsModalOpen(false)}>Close</button>
            </ModalContent>
          </ModalOverlay>
        )}
        <h1>Frodan's Future Sight</h1>
        {selectedPlayer && (
          <PlayerDetailsContainer label={selectedPlayer.name}>
            {isDetailLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <TextContainer>
                  <p>Qualified: </p>
                  <p>Accolades: </p>

                  {selectedPlayer.delist_date && <p>Delist Date: {selectedPlayer.delist_date}</p>}
                </TextContainer>
                <RegionalsChart playerData={{ date: selectedPlayer.date, price: selectedPlayer.price }} />
              </>
            )}
          </PlayerDetailsContainer>
        )}
        <PlayerGrid>
          {players.map(player => (
            <DraggablePlayer
              key={player.id}
              player={player}
              onClick={() => fetchPlayerStats(player.game_name, player.tag_line)}
            />
          ))}
        </PlayerGrid>
        <RankingContainerWrapper>
          <RankingContainer>
            {ranking.map((item, index) => (
              <DropTarget
                key={index}
                index={index}
                player={item.player}
                movePlayer={movePlayer}
                onClick={() => item.player && fetchPlayerStats(item.player.game_name, item.player.tag_line)}
              />
            ))}
          </RankingContainer>
          <QuestionsContainer>
            <Question>
              <QuestionLabel>Best AVP performing comp? (5 games min)</QuestionLabel>
              <QuestionInput type="text" />
            </Question>
            <Question>
              <QuestionLabel>Rank the regionals AVP (NA, LATAM, BR)</QuestionLabel>
              <QuestionInput type="text" />
            </Question>
            <Question>
              <QuestionLabel>Who wins the event?</QuestionLabel>
              <QuestionInput type="text" />
            </Question>
            <Question>
              <QuestionLabel>Highest score for a day?</QuestionLabel>
              <QuestionInput type="text" />
            </Question>
            <Question>
              <QuestionLabel>How many players does NA send to worlds?</QuestionLabel>
              <QuestionInput type="text" />
            </Question>
            <Question>
              <QuestionLabel>Who does better: Bryce or Frodan?</QuestionLabel>
              <QuestionInput type="text" />
            </Question>
          </QuestionsContainer>
        </RankingContainerWrapper>
      </MainContent>
    </DndProvider>
  );
};

export default FFS;
