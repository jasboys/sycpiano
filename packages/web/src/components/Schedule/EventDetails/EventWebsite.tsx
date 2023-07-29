import styled from '@emotion/styled';
import { mix } from 'polished';

import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { lightBlue } from 'src/styles/colors.js';
import { interFont } from 'src/styles/fonts.js';

interface EventWebsiteButtonProps {
    website: string;
    className?: string;
}

const StyledWebsiteButton = styled.a(interFont(300), {
    display: 'block',
    fontSize: '0.85rem',
    width: 'fit-content',
    padding: 11,
    textAlign: 'center',
    color: 'var(--light-blue)',
    transition: 'all 0.25s',
    marginRight: '1rem',
    borderRadius: 4,
    border: '1px solid var(--light-blue)',
    '&:hover': {
        backgroundColor: mix(0.75, lightBlue, 'white'),
        color: 'white',
        cursor: 'pointer',
    },
    [toMedia(screenXS)]: {
        fontSize: '0.75rem',
        padding: 8,
    },
});

export const EventWebsiteButton: React.FC<EventWebsiteButtonProps> = ({
    website,
}) => (
    <StyledWebsiteButton
        href={website}
        target="_blank"
        rel="noopener noreferrer"
    >
        {'Tickets & Info'}
    </StyledWebsiteButton>
);