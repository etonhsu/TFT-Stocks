// RegisterButton.tsx
import React from 'react';
import { StyledButton } from '../../containers/general/SidebarButton.tsx';
import {useModals} from "./ModalContext.tsx";  // Make sure the path is correct

export const RegisterButton: React.FC = () => {
    const { isRegisterOpen, setRegisterOpen } = useModals();

    const handleRegisterClick = () => {
        setRegisterOpen(!isRegisterOpen);
    };

    return (
        <StyledButton onClick={handleRegisterClick}>
            {isRegisterOpen ? 'Register' : 'Register'}
        </StyledButton>
    );
};
