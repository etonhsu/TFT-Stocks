import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MainContent } from "../containers/general/MainContent.tsx";
import { PlayerDetailsContainer } from '../containers/ffs/PlayerContainer';
import { RegionalsChart } from '../components/ffs/RegionalsChart.tsx';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ModalOverlay, ModalContent } from '../containers/multiUse/StyledComponents.tsx';
import { useAuth } from '../utils/Authentication.tsx';
import {
  ContentWrapper,
  DraggablePlayerContainer, PlayerGrid,
  PlayerListWrapper,
  TextContainer
} from "../containers/ffs/PlayerListContainer.tsx";
import {
  PlayerName, PlayerPoints,
  RankingContainer, RankingContainer2,
  RankingContainerWrapper,
  RankingContainerWrapper2,
  RankingItemContainer,
  RankingNumber
} from "../containers/ffs/RankingContainer.tsx";
import {
  Question,
  QuestionInput,
  QuestionLabel,
  QuestionsContainer,
  QuestionSelect, SubmitButton, AnswerBox
} from "../containers/ffs/QuestionContainer.tsx";
import {UserSummary} from "./Dashboard.tsx";

interface Player {
  id: number;
  game_name: string;
  tag_line: string;
  table_name: string;
  total_points: number;
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

interface Question {
  question: string;
  answer: string;
}

interface FutureSightRankingItem {
  player_id: number;
  rank: number;
  game_name: string;
  tag_line: string;
  table_name: string;
  total_points: number;
}

interface LeaderboardEntryData {
  username: string;
  current_points: number;
  picks: FutureSightRankingItem[];
}

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

const DropTarget: React.FC<{ index: number, player: Player | null, movePlayer: (playerId: number, fromIndex: number | null, toIndex: number) => void, onClick: () => void, disableDrag?: boolean }> = ({ index, player, movePlayer, onClick, disableDrag }) => {
  const [, drop] = useDrop(() => ({
    accept: 'PLAYER',
    drop: (item: { id: number, source: string, fromIndex?: number }) => {
      if (!disableDrag) movePlayer(item.id, item.source === 'list' ? null : item.fromIndex!, index);
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

  const calculatePoints = (points: number | undefined, rank: number): string => {
    if (!points) return '0.00';
    let multiplier = 1;
    if (rank === 0) multiplier = 1.3;
    if (rank === 1) multiplier = 1.2;
    if (rank === 2) multiplier = 1.1;
    return (points * multiplier).toFixed(2);
  };

  const points = player ? calculatePoints(player.total_points, index) : '0.00';

  console.log(`DropTarget - Player: ${player?.game_name}, Total Points: ${points}`);

  return (
    <RankingItemContainer
      ref={(node) => disableDrag ? drop(node) : drop(drag(node))}
      onClick={onClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      borderColor={getBorderColor()}
    >
      <RankingNumber>{index + 1}</RankingNumber>
      <PlayerName>{player ? `${player.game_name} (${player.tag_line})` : 'Drop a player here'}</PlayerName>
      {disableDrag && player && (
        <PlayerPoints>
          {points}pts
        </PlayerPoints>
      )}
    </RankingItemContainer>
  );
};

export const FFS: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>(Array(8).fill({ player: null }));
  const [questions, setQuestions] = useState<Question[]>([
    { question: 'Best AVP performing comp? (5 games min)', answer: '' },
    { question: 'Rank the regionals AVP (NA, LATAM, BR)', answer: '' },
    { question: 'Who wins the event?', answer: '' },
    { question: 'Highest score for a day?', answer: '' },
    { question: 'How many players does NA send to worlds?', answer: '' },
    { question: 'Who does better: Bryce or Frodan?', answer: '' }
  ]);
  const [isLoading, setLoading] = useState(true);
  const [isDetailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [hasFutureSight, setHasFutureSight] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryData[]>([]);
  const [selectedUserPicks, setSelectedUserPicks] = useState<Player[]>([]);
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<UserSummary>(`${backendUrl}/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserSummary(response.data);

        const playersResponse = await axios.get<Player[]>(`${backendUrl}/ffs/players`);
        console.log('Players Response:', playersResponse.data); // Add debug statement
        setPlayers(playersResponse.data);
        setLoading(false);
        if (playersResponse.data.length > 0) {
          fetchPlayerStats(playersResponse.data[0].game_name, playersResponse.data[0].tag_line);
        }

        try {
          const hasFutureSightResponse = await axios.get(`${backendUrl}/ffs/has_future_sight`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setHasFutureSight(hasFutureSightResponse.data.hasFutureSight);
          if (hasFutureSightResponse.data.hasFutureSight) {
            const userFutureSightResponse = await axios.get(`${backendUrl}/ffs/user_future_sight`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            console.log('User Future Sight Response:', userFutureSightResponse.data); // Add debug statement

            // Sort ranking based on the rank attribute from the database
            const sortedRanking = userFutureSightResponse.data.ranking.sort((a: FutureSightRankingItem, b: FutureSightRankingItem) => a.rank - b.rank);

            setRanking(sortedRanking.map((item: FutureSightRankingItem) => {
              const playerWithPoints = playersResponse.data.find(p => p.id === item.player_id);
              return {
                player: {
                  id: item.player_id,
                  game_name: item.game_name,
                  tag_line: item.tag_line,
                  table_name: item.table_name,
                  total_points: playerWithPoints?.total_points || 0 // Set total_points
                }
              };
            }));

            // Update questions with the data from the backend
            setQuestions(userFutureSightResponse.data.questions);
          }
        } catch (error) {
          console.error('Error checking future sight:', error);
        }

        // Fetch leaderboard data
        const leaderboardResponse = await axios.get<LeaderboardEntryData[]>(`${backendUrl}/ffs/leaderboard`);
        console.log('Leaderboard Response:', leaderboardResponse.data); // Add debug statement
        const fetchedLeaderboard = leaderboardResponse.data;

        // Find the current user in the leaderboard
        if (userSummary) {
          const currentUserIndex = fetchedLeaderboard.findIndex(entry => entry.username === userSummary.username);

          // Check if the user is in the top 20
          if (currentUserIndex !== -1 && currentUserIndex < 20) {
            setCurrentUserRank(currentUserIndex + 1);
            setLeaderboard(fetchedLeaderboard.slice(0, 20)); // Limit to top 20 entries
          } else {
            setCurrentUserRank(currentUserIndex + 1);
            if (currentUserIndex !== -1) {
              // Replace the 20th user with the current user
              fetchedLeaderboard[19] = fetchedLeaderboard[currentUserIndex];
              setLeaderboard(fetchedLeaderboard.slice(0, 20));
            } else {
              // User not in the leaderboard
              setLeaderboard(fetchedLeaderboard.slice(0, 20));
            }
          }
        }

      } catch (error) {
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
        }
      }
    };
    fetchData();
  }, [backendUrl, token, userSummary]);

  const fetchPlayerStats = async (gameName: string, tagLine: string) => {
    setDetailLoading(true);
    try {
      const response = await axios.get<PlayerStats>(`${backendUrl}/ffs/players/${gameName}/${tagLine}`);
      setSelectedPlayer(response.data);
      setDetailLoading(false);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      setDetailLoading(false);
    }
  };

  const handleLeaderboardClick = (picks: FutureSightRankingItem[]) => {
    const picksWithPoints = picks.map((pick) => {
      const playerWithPoints = players.find(p => p.id === pick.player_id);
      return {
        id: pick.player_id,
        game_name: pick.game_name,
        tag_line: pick.tag_line,
        table_name: pick.table_name,
        total_points: playerWithPoints?.total_points || 0 // Ensure total_points is included
      };
    });
    setSelectedUserPicks(picksWithPoints);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const picksData = ranking.map((item, index) => ({
      player_id: item.player?.id,
      table_name: item.player?.table_name,
      rank: index + 1
    }));

    const requestData = {
      picks: picksData,
      questions: questions.map(q => ({ question: q.question, answer: q.answer }))
    };

    try {
      await axios.post(`${backendUrl}/ffs`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Handle successful submission (e.g., show success message)
      window.location.reload();
    } catch (error) {
      setError('An error occurred while submitting your data.');
      console.error('Error submitting data:', error);
      setIsSubmitting(false);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].answer = value;
    setQuestions(updatedQuestions);
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
        <ContentWrapper>
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
          <RankingContainerWrapper>
            <QuestionsContainer>
              {questions.map((q, index) => (
                <Question key={index}>
                  <QuestionLabel>{q.question}</QuestionLabel>
                  {hasFutureSight ? (
                    <AnswerBox>{q.answer}</AnswerBox>
                  ) : (
                    <>
                      {q.question === 'Highest score for a day?' ? (
                        <QuestionInput
                          type="number"
                          value={q.answer}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                        />
                      ) : (
                        <QuestionSelect
                          value={q.answer}
                          onChange={(e) => handleQuestionChange(index, e.target.value)}
                        >
                          {q.question === 'Best AVP performing comp? (5 games min)' && (
                            <>
                              <option value="">Select an option</option>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </>
                          )}
                          {q.question === 'Rank the regionals AVP (NA, LATAM, BR)' && (
                            <>
                              <option value="">Select an option</option>
                              {[
                                '1. NA | 2. BR | 3. LATAM', '1. NA | 2. LATAM | 3. BR', '1. BR | 2. NA | 3. LATAM',
                                '1. BR | 2. LATAM | 3. NA', '1. LATAM | 2. NA | 3. BR', '1. LATAM | 2. BR | 3. NA'
                              ].map((order) => (
                                <option key={order} value={order}>{order}</option>
                              ))}
                            </>
                          )}
                          {q.question === 'Who wins the event?' && (
                            <>
                              <option value="">Select an option</option>
                              {players.map((player) => (
                                <option key={player.id} value={player.game_name}>
                                  {player.game_name}
                                </option>
                              ))}
                            </>
                          )}
                          {q.question === 'How many players does NA send to worlds?' && (
                            <>
                              <option value="">Select an option</option>
                              {[1, 2, 3, 4, 5, 6].map((num) => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </>
                          )}
                          {q.question === 'Who does better: Bryce or Frodan?' && (
                            <>
                              <option value="">Select an option</option>
                              {['Bryce', 'Frodan'].map((name) => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </>
                          )}
                        </QuestionSelect>
                      )}
                    </>
                  )}
                </Question>
              ))}
            </QuestionsContainer>
            <RankingContainer>
              {ranking.map((item, index) => (
                <DropTarget
                  key={index}
                  index={index}
                  player={item.player}
                  movePlayer={movePlayer}
                  onClick={() => item.player && fetchPlayerStats(item.player.game_name, item.player.tag_line)}
                  disableDrag={hasFutureSight}
                />
              ))}
            </RankingContainer>

            <PlayerListWrapper>
              <PlayerGrid>
                {players.map(player => (
                    <DraggablePlayer
                        key={player.id}
                        player={player}
                        onClick={() => fetchPlayerStats(player.game_name, player.tag_line)}
                    />
                ))}
              </PlayerGrid>
            </PlayerListWrapper>
          </RankingContainerWrapper>

          {!hasFutureSight &&
              <SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Loading...' : 'Submit'}
              </SubmitButton>
          }
          <RankingContainerWrapper2>
          {/* Leaderboard Section */}
            <RankingContainer>
              <h2>Leaderboard</h2>
              {leaderboard.map((entry, index) => (
                <RankingItemContainer
                  key={index}
                  borderColor={entry.username === userSummary?.username ? 'cornflowerblue' : '#666'}
                  onClick={() => handleLeaderboardClick(entry.picks)}
                >
                  <RankingNumber>{entry.username === userSummary?.username ? currentUserRank : index + 1}</RankingNumber>
                  <PlayerName>{entry.username}</PlayerName>
                  <PlayerPoints>{entry.current_points.toFixed(2)}pts</PlayerPoints>
                </RankingItemContainer>
              ))}
            </RankingContainer>
            {/* Display selected user's picks */}
            <RankingContainer2>
              <h2>Selected User's Picks</h2>
              {selectedUserPicks.map((item, index) => (
                <DropTarget
                  key={index}
                  index={index}
                  player={item}
                  movePlayer={() => {}}
                  onClick={() => fetchPlayerStats(item.game_name, item.tag_line)}
                  disableDrag={true}
                />
              ))}
            </RankingContainer2>
          </RankingContainerWrapper2>
        </ContentWrapper>
      </MainContent>
    </DndProvider>
  );
};

export default FFS;
