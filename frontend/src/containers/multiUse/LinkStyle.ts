import styled from "styled-components";
import {PlayerLink} from "../../components/player/PlayerLink.tsx";
import {UserLink} from "../../components/user/UserLink.tsx";

export const StyledPlayerLink = styled(PlayerLink)`
    color: cornflowerblue; // Example color
    text-decoration: none;

    &:hover {
        text-decoration: underline;
        color: #646cff; // Change color on hover
    }
`;

export const StyledUserLink = styled(UserLink)`
    color: cornflowerblue; // Example color
    text-decoration: none;

    &:hover {
        text-decoration: underline;
        color: #646cff; // Change color on hover
    }
`;