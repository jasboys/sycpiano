import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { interFont } from 'src/styles/fonts.js';
import { Piece } from '../types.js';

interface EventProgramProps {
    program: Piece[];
}

const eventProgramStyle = css(interFont(360), {
    listStyle: 'none',
    padding: 0,
    paddingLeft: '1rem',
    textIndent: '-1rem',
    fontSize: '1rem',
    margin: '1rem 0 1rem 0.5rem',
    lineHeight: '1.4rem',
    [toMedia(screenXS)]: {
        fontSize: '0.8rem',
        margin: '0.5rem 0 0.5rem 0.5rem',
        lineHeight: '1.2rem',
    },
});

const PieceDiv = styled.span(interFont(200));

export const EventProgram: React.FC<EventProgramProps> = ({ program }) => (
    <div css={eventProgramStyle}>
        {program.map(({ composer, piece }: Piece) => (
            <div key={`${composer}-${piece}`}>
                {composer}
                {piece ? ' ' : ''}
                <PieceDiv>{piece}</PieceDiv>
            </div>
        ))}
    </div>
);
