import React from 'react';
import styled from 'styled-components';

// Updated StyledText component to include padding
const StyledText = styled.span<{ size: string, weight: string, color?: string, padding?: string }>`
  font-size: ${({ size }) => size};
  font-weight: ${({ weight }) => weight};
  color: ${({ color }) => color || 'inherit'}; // Use inherited color if not specified
  padding: ${({ padding }) => padding || '0'}; // Default padding to 0 if not specified
  margin: ${({ padding }) => padding || '0'};
`;

type TextProps = {
  size: string;
  weight: string;
  color?: string;
  padding?: string; // Optional padding prop
  margin?: string;
  children: React.ReactNode;
};

export const Text: React.FC<TextProps> = ({ size, weight, color, padding, children }) => {
  return (
    <StyledText size={size} weight={weight} color={color} padding={padding}>
      {children}
    </StyledText>
  );
};
