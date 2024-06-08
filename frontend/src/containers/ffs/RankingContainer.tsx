import styled from "styled-components";

export const RankingContainerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  padding-bottom: 30px;
  width: 76vw;
`;

export const RankingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 450px;
  margin-right: 50px;
`;

export const RankingItemContainer = styled.div<{ borderColor: string }>`
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

export const RankingNumber = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #EAEAEA;
`;