import React, {useState} from 'react';

import {ModalContent, ModalOverlay} from "../../containers/multiUse/StyledComponents.tsx";
import {NotificationIcon, NotificationIcon2} from "../../assets/Icons.tsx";
import styled from "styled-components";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

export const StyledButton = styled.button`
    display: flex;
    align-items: center; /* Vertically center the children */
    justify-content: center; /* Aligns children (icon and text) to the start of the container */
    font-weight: normal;
    font-size: 16px;
    background: #333; // Use the color from your design
    color: #EAEAEA;
    text-decoration: none;
    border: none; // Remove default button border
    border-radius: 4px;
    width: 65px;
    margin-top: 5px;
    cursor: pointer; // Ensure it's recognizable as a clickable button

    svg {
        height: 25px; /* Adjust height to match your design */
        width: 25px; /* Adjust width to maintain aspect ratio */
    }

    &:hover {
        background: #444; // Slightly lighter color on hover
        color: cornflowerblue;
    }

    &:active {
        background: #555; // An even lighter color for active or focus state
    }

    &:focus {
        outline: none; // Removes the outline to match NavLink behavior
    }
`;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, text }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
          <p>{text}<br/><br/>- 2 Brain Cell</p>
        <button onClick={onClose}>Close</button>
      </ModalContent>
    </ModalOverlay>
  );
};

const currentNotification = {
  message:  "Hey everyone, I know it's been a while, but I'm excited to be able to introduce the new and improved version of TFT " +
            "Stocks! This version fixes a lot of the bugs that were present before, as well as adds the new leagues feature! " +
            "Currently all users are enrolled in 2 leagues, a set league and a monthly league. I am going to work with riot to see if I'm " +
            "allowed to give prizes for the winners of each league as well! On top of that, you can create a custom league to compete with friends. " +
            "I'm sure there will be issues with leagues the same way there were with transactions before, so please bear with me, but I hope " +
            "you all enjoy the site, and thank you all so much for the support!",
  version: 8
};

export const ButtonWithModal: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [notificationAcknowledged, setNotificationAcknowledged] = useState(() => {
    const lastSeenVersion = parseInt(localStorage.getItem('lastSeenNotificationVersion') || '0', 10);
    return lastSeenVersion >= currentNotification.version;
  });

  const handleOpenModal = () => {
    setModalOpen(true);
    setNotificationAcknowledged(true);
    localStorage.setItem('lastSeenNotificationVersion', currentNotification.version.toString());
  };
  const handleCloseModal = () => setModalOpen(false);

  return (
    <>
        <div> {/* Container with specific width */}
            <StyledButton onClick={handleOpenModal}>
                {notificationAcknowledged ? <NotificationIcon /> : <NotificationIcon2 />}
            </StyledButton>
        </div>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}
               text={currentNotification.message}
        />
    </>
  );
};
