import styled from "styled-components";

export const LeaderboardContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

export const LeaderboardEntry = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

export const LeaderboardItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  background-color: #333;
  color: #fff;
  border-bottom: 1px solid #444;
  cursor: pointer;
  &:hover {
    background-color: #444;
  }
`;

export const LeaderboardUsername = styled.span`
  flex: 1;
  text-align: left;
`;

export const LeaderboardPoints = styled.span`
  font-weight: bold;
  text-align: right;
`;