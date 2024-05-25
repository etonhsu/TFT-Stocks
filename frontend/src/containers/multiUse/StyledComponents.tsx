import styled from "styled-components";

export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; // Ensure it's above other content
`;

export const ModalContent = styled.div`
    background: #222;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    max-width: 500px;
    width: 90%;
    z-index: 1001; // Above the overlay
`;