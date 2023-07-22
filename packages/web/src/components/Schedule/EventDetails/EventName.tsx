import { css } from "@emotion/react";
import { toMedia } from "src/mediaQuery.js";
import { screenXS } from "src/screens.js";
import { logoBlue } from "src/styles/colors.js";
import { latoFont } from "src/styles/fonts.js";
import { EventType } from "src/components/Schedule/types.js";

interface EventNameProps {
    name: string;
    eventType: EventType;
    isMobile?: boolean;
    permaLink: string
}

const eventNameStyle = css(
    latoFont(400),
    {
        fontSize: '1.55rem',
        transition: 'color 0.2s',
        color: logoBlue,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '0.4rem',
        wordBreak: 'break-word',

        '&:hover': {
            cursor: 'pointer',
        },

        [toMedia(screenXS)]: {
            fontSize: '1.25rem',
        },
    });

export const EventName: React.FC<EventNameProps> = ({ name, eventType }) => {
    return (
        <div css={eventNameStyle}>
            <span>
                {`${name}${eventType === 'masterclass' ? ': Masterclass' : ''}`}
            </span>
        </div>
    );
};