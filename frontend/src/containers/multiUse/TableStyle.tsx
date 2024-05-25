import styled from "styled-components";

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const ClickStyledHeader = styled.th`
    background-color: #222;
    padding: 12px;
    border: 1px solid #EAEAEA;
    text-align: left;
    cursor: pointer;  // Make it obvious it's clickable
`;

export const StyledHeader= styled.th`
    background-color: #222;
    padding: 12px;
    border: 1px solid #EAEAEA;
    text-align: left;
`;

export const StyledRow = styled.tr`
  background-color: #222
`;

export const StyledCell = styled.td`
    padding: 16px 16px 16px 10px;
    border: 1px solid #777;
    text-align: left;
    align-items: flex-start;
`;