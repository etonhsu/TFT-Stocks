import styled from "styled-components";
import {NavLink} from "react-router-dom";

export const StyledLink = styled(NavLink)`
    display: block;
    align-items: center; /* This line will vertically center the children */
    justify-content: flex-start; /* Aligns children (icon and text) to the start of the container */
    padding: 10px 15px;
    margin: 5px 0;
    font-weight: normal;
    font-size: 16px;
    background: #333; // Use the color from your design
    color: #EAEAEA;
    text-decoration: none;
    border-radius: 4px;
    width: calc(100% - 30px);
    
    svg {
    /* If your icon size is different from the text line-height, adjust margins */
        margin-right: 8px; /* Space between icon and text */
        transform: translateY(4px);
        height: 20px; /* Adjust height to match your design */
        width: 20px; /* Adjust width to maintain aspect ratio */
    /* Remove any top or bottom margin if present */
  }
    
    &:hover {
        background: #444; // Slightly lighter color on hover
        color: cornflowerblue;
    }

    &.active {
        background: #555; // An even lighter color for active link
    }
`;