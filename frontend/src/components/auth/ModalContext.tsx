import { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
    isLoginOpen: boolean;
    setLoginOpen: (open: boolean) => void;
    isRegisterOpen: boolean;
    setRegisterOpen: (open: boolean) => void;
    isSettingsOpen: boolean;
    setSettingsModalOpen: (open: boolean) => void;
    isLeagueEditOpen: boolean;
    setLeagueEditOpen: (open: boolean) => void;
    isCreateLeagueOpen: boolean;
    setCreateLeagueOpen: (open: boolean) => void;
    isJoinLeagueOpen: boolean;
    setJoinLeagueOpen: (open: boolean) => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const defaultModalValues: ModalContextType = {
    isLoginOpen: false,
    setLoginOpen: () => {}, // Provide no-op functions as default
    isRegisterOpen: false,
    setRegisterOpen: () => {},
    isSettingsOpen: false,
    setSettingsModalOpen: () => {},
    isLeagueEditOpen: false,
    setLeagueEditOpen: () => {},
    isCreateLeagueOpen: false,
    setCreateLeagueOpen: () => {},
    isJoinLeagueOpen: false,
    setJoinLeagueOpen: () => {},
};

const ModalContext = createContext<ModalContextType>(defaultModalValues);

export const useModals = () => useContext(ModalContext);

export function ModalProvider({ children }: AuthProviderProps) {
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isRegisterOpen, setRegisterOpen] = useState(false);
    const [isSettingsOpen, setSettingsModalOpen] = useState(false);
    const [isLeagueEditOpen, setLeagueEditOpen] = useState(false);
    const [isCreateLeagueOpen, setCreateLeagueOpen] = useState(false);
    const [isJoinLeagueOpen, setJoinLeagueOpen] = useState(false);

    return (
        <ModalContext.Provider value={{
            isLoginOpen,
            setLoginOpen,
            isRegisterOpen,
            setRegisterOpen,
            isSettingsOpen,
            setSettingsModalOpen, // Ensure this is included everywhere it's needed
            isLeagueEditOpen,
            setLeagueEditOpen,
            isCreateLeagueOpen,
            setCreateLeagueOpen,
            isJoinLeagueOpen,
            setJoinLeagueOpen,

        }}>
            {children}
        </ModalContext.Provider>
    );
}
