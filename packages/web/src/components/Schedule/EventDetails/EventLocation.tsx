import { css } from '@emotion/react';
import { desaturate } from 'polished';
import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { lightBlue, logoBlue } from 'src/styles/colors.js';
import { LocationIconInstance } from '../LocationIconSVG.jsx';
import { getGoogleMapsSearchUrl } from '../utils.js';
import styled from '@emotion/styled';


const locationIconDimension = 24;

interface EventLocationProps { location: string; className?: string; isMobile?: boolean }

const getVenueName = (location: string): string => {
    if (!location) {
        return '';
    }

    // Example location string:
    // Howard L. Schrott Center for the Arts, 610 W 46th St, Indianapolis, IN 46208, USA
    const locArray = location.split(', ');
    return locArray.length >= 1 ? locArray[0] : '';
};

const locationIconStyle = css({
    height: locationIconDimension,
    width: locationIconDimension,
    stroke: desaturate(0.15)(lightBlue),
    fill: desaturate(0.15)(lightBlue),
    flex: '0 0 auto',
    [toMedia(screenXS)]: {
        height: 0.8 * locationIconDimension,
        width: 0.8 * locationIconDimension,
    },
});

const eventLocationStyle = css({
    fontSize: '1rem',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 'fit-content',
    textDecoration: 'underline solid transparent',
    transition: 'text-decoration-color 0.2s',
    margin: '0.3rem 0',
    marginLeft: 1,
    '&:hover': {
        color: logoBlue,
        textDecorationColor: logoBlue,
    },
    [toMedia(screenXS)]: {
        fontSize: '0.8rem',
        marginTop: 0,
    }
});

const VenueSpan = styled.span({
    marginLeft: 10,
    [toMedia(screenXS)]: {
        marginLeft: 5,
    }
})

export const EventLocation: React.FC<EventLocationProps> = ({ location, isMobile }) => {
    return (
        <a
            href={getGoogleMapsSearchUrl(location)}
            css={eventLocationStyle}
            target="_blank"
            rel="noopener noreferrer"
        >
            <LocationIconInstance css={locationIconStyle} />

            <VenueSpan>
                {getVenueName(location)}
            </VenueSpan>
        </a>
    );
};