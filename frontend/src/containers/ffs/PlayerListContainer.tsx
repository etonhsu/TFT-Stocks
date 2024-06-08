import styled from "styled-components";

export const ContentWrapper = styled.div`
  flex: 1;
  padding: 20px;
`;

export const PlayerListWrapper = styled.div`
  width: 300px;
  height: 558px;
  position: sticky;
  top: 0;
  background-color: #222;
  overflow-y: auto;
  padding-right: 20px;

  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #666;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: #222;
  }
`;

export const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 10px;
`;

export const DraggablePlayerContainer = styled.div`
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

export const TextContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  width: 400px;
`;
