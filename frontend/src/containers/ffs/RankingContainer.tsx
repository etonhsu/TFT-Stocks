import styled from "styled-components";

export const RankingContainerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  padding-bottom: 30px;
  width: 76vw;
`;

export const RankingContainerWrapper2 = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  padding-bottom: 30px;
  width: 76vw;
    margin-left: 50px;
`;

export const RankingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 450px;
  margin-right: 50px;
`;

export const RankingContainer2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 450px;
  margin-left: 20px;
    height: 67vh;
`;

export const RankingItemContainer = styled.div<{ borderColor: string }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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



export const RankingNumber = styled.span`
  position: absolute;
  font-size: 18px;
  font-weight: bold;
  color: #EAEAEA;
`;

export const PlayerName = styled.span`
  flex-grow: 1;
  text-align: center;
    margin-left: 40px;
`;

export const PlayerPoints = styled.span`
  font-weight: bold;
`;