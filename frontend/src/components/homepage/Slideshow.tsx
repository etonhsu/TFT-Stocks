import { useState, useEffect } from 'react';
import {MainContent} from "../../containers/general/MainContent.tsx";
import styled from "styled-components";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {Text} from "../../containers/dashboard/TextStyle.tsx";

interface Slide {
    url: string;
    text: string;
}

const slides: Slide[] = [
    { url: 'https://imagedelivery.net/FyOCiyhdHuuNE-YjBaGjlg/40774de9-31a3-4d4f-7511-c3dc55369100/public', text: 'A Trading Platform for the TFT Ladder' },
    { url: 'https://imagedelivery.net/FyOCiyhdHuuNE-YjBaGjlg/27f934ac-9683-46fb-e486-ae6abcb16800/public', text: "Go Long on Your Favorite Players" },
    { url: 'https://imagedelivery.net/FyOCiyhdHuuNE-YjBaGjlg/ad70776e-fb93-4851-43ba-7a48b2922d00/public', text: 'See Who is Doing Well...' },
    { url: 'https://imagedelivery.net/FyOCiyhdHuuNE-YjBaGjlg/9871ce4d-dc20-402a-8dbd-ebaf42e4f400/public', text: '...Or Not So Well' },
    { url: 'https://imagedelivery.net/FyOCiyhdHuuNE-YjBaGjlg/ab4bebf5-51b2-4f12-1469-1b463d8eee00/public', text: 'Grow Your Portfolio into a Hedge Fund++'}
];


const SlideshowWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
`;

const SlideshowContainer = styled.div`
    width: 100%;
    height: auto;
    display: flex;
    position: relative;
`;

const TransitionContainer = styled.div`
    width: 100%;
    height: auto;
    position: relative;
`;

const ImageContainer = styled.div`
    width: 100%; // You might want to set a max-width or specific width
    height: 500px; // Set a fixed height to prevent layout shift
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden; // Prevents the image from overflowing the container
    margin-top: 0;
`;

const Image = styled.img`
    max-width: 100%; // Maximum width of the image is 100% of the container
    max-height: 100%; // Maximum height of the image is 100% of the container
    width: auto; // Maintain the aspect ratio
    height: auto; // Maintain the aspect ratio
    transition: transform 0.5s ease; // Smooth transition for transform effects
    transform-origin: center; // Ensures the scaling is centered
`;

const TextContainer = styled.div`
    width: 90%;
    display: flex;  // Uses flexbox layout
    flex-direction: column;  // Stacks children vertically
    align-items: center;  // Centers children horizontally
    justify-content: center;  // Centers children vertically
    text-align: center;  // Ensures text is centered within each text element
    
`;

const SlideText = styled(Text)`
    color: #EAEAEA; // Slightly lighter color for less emphasis
    margin-bottom: 0;
`;

const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log('Backend URL:', backendUrl); // This will log the URL to the console


export const Slideshow = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prevSlide) =>
                prevSlide === slides.length - 1 ? 0 : prevSlide + 1
            );
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <MainContent>
            <TextContainer>
                <Text size="52px" weight="bold" color='#EAEAEA' padding='10px 0px 5px 0'>
                    Welcome to TFT Stocks
                </Text>
                <SlideText size="24px" weight="normal">
                    {slides[currentSlide].text}
                </SlideText>
            </TextContainer>
            <SlideshowWrapper>
                <SlideshowContainer>
                    <TransitionContainer>
                        <TransitionGroup>
                            <CSSTransition
                                key={slides[currentSlide].url}
                                timeout={500}
                                classNames="fade"
                            >
                                <ImageContainer>
                                    <Image src={slides[currentSlide].url} alt="Slideshow" />
                                </ImageContainer>

                            </CSSTransition>
                        </TransitionGroup>
                    </TransitionContainer>
                </SlideshowContainer>
            </SlideshowWrapper>
        </MainContent>
    );
};