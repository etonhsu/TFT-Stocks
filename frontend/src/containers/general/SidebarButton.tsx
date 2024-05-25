import styled from "styled-components";

export const StyledButton = styled.button`
    display: flex;
    align-items: center; /* Vertically center the children */
    justify-content: flex-start; /* Aligns children (icon and text) to the start of the container */
    padding: 13px 15px;
    margin: 5px 0;
    font-weight: normal;
    font-size: 16px;
    background: #333; // Use the color from your design
    color: #EAEAEA;
    text-decoration: none;
    border: none; // Remove default button border
    border-radius: 4px;
    width: calc(100%);
    cursor: pointer; // Ensure it's recognizable as a clickable button

    svg {
        margin-right: 8px; /* Space between icon and text */
        transform: translateY(4px);
        height: 20px; /* Adjust height to match your design */
        width: 20px; /* Adjust width to maintain aspect ratio */
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
