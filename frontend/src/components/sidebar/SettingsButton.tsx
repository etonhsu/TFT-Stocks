import React from 'react';
import {StyledButton} from "../../containers/general/SidebarButton.tsx";
import {SettingsIcon} from "../../assets/Icons.tsx";
import styled from "styled-components";
import { useModals } from "../auth/ModalContext.tsx";
import { useAuth } from '../../utils/Authentication.tsx'; // Adjust the path as needed

const IconContainer = styled.div`
    margin-bottom: 1px;
    margin-left: 2px;
`;

export const SettingsButton: React.FC = () => {
  const { isSettingsOpen, setSettingsModalOpen } = useModals();
  const { token } = useAuth(); // Get the authentication token

  if (!token) return null; // Only show the button if the user is logged in

  const toggleSettings = () => {
    setSettingsModalOpen(!isSettingsOpen);
  };

  return (
    <StyledButton onClick={toggleSettings}>
        <IconContainer>
            <SettingsIcon/>
        </IconContainer>
        Settings
    </StyledButton>
  );
};
