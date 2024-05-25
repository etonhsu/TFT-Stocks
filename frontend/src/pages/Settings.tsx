import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useModals } from '../components/auth/ModalContext.tsx'
import { ModalContent, ModalOverlay } from '../containers/multiUse/StyledComponents.tsx';
import {ChangeUsername} from "../components/auth/ChangeUsername.tsx";
import {ChangePassword} from "../components/auth/ChangePassword.tsx";
import {Text} from "../containers/dashboard/TextStyle.tsx";
import {useAuth} from "../utils/Authentication.tsx";

interface UserSelf {
  username: string;
  one_day_change: number;
  three_day_change: number;
  rank: number;
  balance: number;
  date_registered: string;
  password?: string; // Optional in case it's needed somewhere securely
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', // 'long' for full month name, '2-digit' for numerical month
    day: '2-digit'  // '2-digit' ensures day is always two digits
  });
};

export const Settings: React.FC = () => {
  const [settingsData, setSettingsData] = useState<UserSelf | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();const { isSettingsOpen, setSettingsModalOpen } = useModals();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/');
        return;
      }


      try {
        const response = await axios.get(`${backendUrl}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSettingsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
        setLoading(false);
        setError('Failed to fetch sidebar');
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/');
        }
      }
    };

    fetchData();
  }, [backendUrl, navigate, token]);

  if (!isSettingsOpen) return null;

  if (isLoading) {
    return <ModalOverlay><ModalContent>Loading settings...</ModalContent></ModalOverlay>;
  }

  if (error) {
    return <ModalOverlay><ModalContent>Error: {error}</ModalContent></ModalOverlay>;
  }

  return (
    <ModalOverlay onClick={() => setSettingsModalOpen(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <Text size="48px" weight="bold" color='#EAEAEA'>
            Settings
          </Text>
          <Text size="18px" weight="normal" color='#EAEAEA' padding={"5px 0px 5px 0px"}>
            Username: {settingsData?.username}
          </Text>
          <Text size="18px" weight="normal" color='#EAEAEA'>
            Date Joined: {formatDate(settingsData?.date_registered)}
          </Text>
          <ChangeUsername onClose={() => setSettingsModalOpen(false)} />
          <ChangePassword onClose={() => setSettingsModalOpen(false)}/>
        </ModalContent>
    </ModalOverlay>
  );
};
