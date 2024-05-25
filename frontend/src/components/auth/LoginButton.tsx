import {StyledButton} from "../../containers/general/SidebarButton.tsx";
import {useModals} from "./ModalContext.tsx";

export const LoginButton = () => {
  const { isLoginOpen, setLoginOpen } = useModals();

  const handleLogin = () => {
    // Toggle modal open/close based on current state
    setLoginOpen(!isLoginOpen);
  };

  return (
    <StyledButton onClick={handleLogin}>
      {isLoginOpen ? 'Login' : 'Login'}
    </StyledButton>
  );
};
