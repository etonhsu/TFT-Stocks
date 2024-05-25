import styled from "styled-components";
import {ReactNode} from "react";


interface PerformersDetailsProps {
  label: string;
  children: ReactNode; // If you only expect elements, use ReactElement instead
}

const PerformersDetailsWrapper = styled.div`
    margin-top: 10px;
    position: relative; // This will allow you to absolutely position the label
`;

const PerformersDetailsLabel = styled.span`
  position: absolute;
  top: -20px; // Adjust as necessary to move the label above the container
  left: 10px; // Adjust as necessary to align the label with the container's border
  background: #222; // Match the background of the site to cover the container's border
  padding: 0 5px;
  font-size: 24px; // Adjust as necessary
  color: #EAEAEA; // Label text color
`;

const PerformersDetails = styled.div`
    height: 185px;
    min-width: 300px;
    border: 3px solid #666;
    border-radius: 10px;
`;

export const PerformersDetailsContainer: React.FC<PerformersDetailsProps> = ({ label, children }) => {
  return (
    <PerformersDetailsWrapper>
      <PerformersDetailsLabel>{label}</PerformersDetailsLabel>
      <PerformersDetails>{children}</PerformersDetails>
    </PerformersDetailsWrapper>
  );
};