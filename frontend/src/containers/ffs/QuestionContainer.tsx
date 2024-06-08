import styled from "styled-components";

export const QuestionsContainer = styled.div`
  display: grid;
  grid-gap: 20px;
  width: 400px;
  margin-left: 50px;
  margin-right: 50px;
`;

export const Question = styled.div`
  display: flex;
  flex-direction: column;
`;

export const QuestionLabel = styled.label`
  margin-bottom: 10px;
  font-size: 16px;
  color: #EAEAEA;
`;

export const QuestionInput = styled.input`
  padding: 8px;
  border: 1px solid #666;
  border-radius: 5px;
  background-color: #222;
  color: #EAEAEA;
`;

export const QuestionSelect = styled.select`
  padding: 8px;
  border: 1px solid #666;
  border-radius: 5px;
  background-color: #222;
  color: #EAEAEA;
`;

export const AnswerBox = styled.div`
  padding: 8px;
  border: 1px solid #EAEAEA;
  border-radius: 10px;
  background-color: #222;
  color: #EAEAEA;
`;

export const SubmitButton = styled.button`
  padding: 10px 20px;
  background-color: #555;
  color: #EAEAEA;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 50px;
  margin-bottom: 20px;
  &:hover {
    background-color: #666;
  }
`;