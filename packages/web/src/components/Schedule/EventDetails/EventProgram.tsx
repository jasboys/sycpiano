import { css } from '@emotion/react';
import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { latoFont } from 'src/styles/fonts.js';
import { Piece } from '../types.js';

interface EventProgramProps {
    program: Piece[];
}

const eventProgramStyle = css(
    latoFont(200),
    {
        listStyle: 'none',
        padding: 0,
        paddingLeft: '1rem',
        textIndent: '-1rem',
        fontSize: '1rem',
        margin: '0.5rem 0',
        [toMedia(screenXS)]: {
            fontSize: '0.8rem',
        }
    });

export const EventProgram: React.FC<EventProgramProps> = ({ program }) => (
    <div css={eventProgramStyle}>
        {program.map(({ composer, piece }: Piece, i: number) => (
            <div key={i}>
                {composer}{piece ? ' ' : ''}<i>{piece}</i>
            </div>
        ))}
    </div>
);
