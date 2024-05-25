import styled from 'styled-components';

export const HeaderBar = styled.header`
    width: 100%;
    height: 9%; /* Example height */
    background-color: #333; /* Example background color */
    margin-left: 9%;
    padding-left: 130px;
    color: #EAEAEA;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed; /* Fix it to the top */
    top: 0; /* No space from the top */
    border-bottom: 1px solid #444;
    z-index: 90; /* Ensure it's above other content */
`;

export const HeaderRight = styled.div`
    display: flex;
    margin-right: 17vw;
`


