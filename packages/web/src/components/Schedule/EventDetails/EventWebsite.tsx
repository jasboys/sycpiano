import styled from "@emotion/styled";
import { mix } from "polished";
import { toMedia } from "src/mediaQuery.js";
import { screenXS } from "src/screens.js";
import { lightBlue } from "src/styles/colors.js";
import { latoFont } from "src/styles/fonts.js";


interface EventWebsiteButtonProps {
    website: string;
    className?: string;
}

const StyledWebsiteButton = styled.a(
    latoFont(200),
    {
        display: 'block',
        fontSize: '1.1rem',
        width: 'fit-content',
        padding: 11,
        textAlign: 'center',
        backgroundColor: 'var(--light-blue)',
        color: 'white',
        transition: 'all 0.25s',
        marginRight: '1rem',
        '&:hover': {
            backgroundColor: mix(0.75, lightBlue, 'white'),
            color: 'white',
            cursor: 'pointer',
        },

        [toMedia(screenXS)]: {
            fontSize: '1.0rem',
        }
    });

export const EventWebsiteButton: React.FC<EventWebsiteButtonProps> = ({ website }) => (
    <StyledWebsiteButton href={website} target="_blank" rel="noopener noreferrer">
        {`Tickets & Info`}
    </StyledWebsiteButton>
);