import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { startCase } from 'lodash-es';
import { toMedia } from 'src/mediaQuery.js';
import { screenXS } from 'src/screens.js';
import { latoFont } from 'src/styles/fonts.js';
import { Collaborator } from '../types.js';

interface EventCollaboratorsProps {
    collaborators: Collaborator[];
    className?: string;
}

const eventCollaboratorsStyle = css(
    latoFont(200),
    {
        listStyle: 'none',
        padding: 0,
        fontSize: '1rem',
        margin: '0.5rem 0',
        [toMedia(screenXS)]: {
            fontSize: '0.8rem',
        }
    });

const CollaboratorName = styled.span({
    fontWeight: 'bold',
});

export const EventCollaborators: React.FC<EventCollaboratorsProps> = ({ collaborators }) => (
    <div css={eventCollaboratorsStyle}>
        {collaborators.map((collaborator: Collaborator, i: number) => (
            collaborator.name && collaborator.instrument && (
                <div key={i}>
                    <CollaboratorName>{collaborator.name}</CollaboratorName>{' - '}
                    <span css={{ fontSize: '0.8em' }}>{startCase(collaborator.instrument)}</span>
                </div>
            )
        ))}
    </div>
);
