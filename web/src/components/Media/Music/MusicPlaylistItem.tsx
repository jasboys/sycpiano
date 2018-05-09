import * as React from 'react';
import styled, { css } from 'react-emotion';

import startCase from 'lodash-es/startCase';
import * as path from 'path';

import { Link } from 'react-router-dom';

import { isMusicItem, MusicFileItem, MusicListItem } from 'src/components/Media/Music/types';
import { formatTime, getLastName, normalizeString } from 'src/components/Media/Music/utils';

import { lightBlue, playlistBackground } from 'src/styles/colors';

interface MusicPlaylistItemProps {
    readonly play: () => void;
    readonly item: MusicListItem;
    readonly currentItemId: number | string;
    readonly baseRoute: string;
    readonly onClick: (item: MusicFileItem) => void;
}

const baseItemStyle = css`
    background-color: ${playlistBackground};
    list-style: none;
    cursor: pointer;
    width: 100%;

    &:hover {
        background-color: white;
    }
`;

const StyledMusicItem = styled('li') `
    ${baseItemStyle}
`;

const StyledCollectionItem = styled('li') `
    ${baseItemStyle}
    margin-left: 15px;
    width: auto;
    border: none;
`;

interface HighlightProps { active: boolean; }

const Highlight = styled<HighlightProps, 'div'>('div') `
    padding: 10px 10px 10px 15px;
    border-left: 7px solid transparent;
    ${(props) => props.active && `border-left-color: ${lightBlue};`}
    transition: all 0.15s;

    ${/* sc-selector */ StyledCollectionItem as any} & {
        border-left: 7px solid transparent;
        ${(props) => props.active && `border-left: 7px solid ${lightBlue};`}
    }
`;

const section = css`
    vertical-align: middle;
    display: inline-block;
`;

const h4style = css`
    margin: 0;
    color: black;
    font-size: 0.9rem;
    display: inline-block;
    line-height: 1rem;
`;

const TextLeft = styled('h4') `
    ${h4style}
`;

const TextRight = styled('h4') `
    ${h4style}
    margin: 0 0 0 10px;
    font-size: 0.75rem;
`;

const StyledCollectionContainer = styled('li') `
    padding: 10px 0;
`;

const StyledCollectionList = styled('ul') `
    padding: 0;
`;

const StyledCollectionTitleContainer = styled('div') `
    position: relative;
    height: 100%;
    background-color: ${playlistBackground};
    padding: 10px 10px 10px 22px;
`;

const StyledInfo = styled('div') `
    ${section as any}
    width: 100%;
    height: 100%;
    position: relative;
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    ${/* sc-selector */ StyledCollectionItem as any} &,
    ${/* sc-selector */ StyledCollectionTitleContainer as any} & {
        padding: 0;
    }
`;

const StyledCategory = styled('div') `
    background-color: #eee;
    padding: 12px 0 12px 22px;
    font-size: 1.2rem;
`;

const getComposerTitleYear = (composer: string, piece: string, year: number) => {
    const compStr = composer === 'Sean Chen' ? '' : `${composer} `;
    const yearStr = year ? ` (${year})` : '';
    return `${compStr}${piece}${yearStr}`;
};

const MusicPlaylistItem: React.SFC<MusicPlaylistItemProps> = ({
    play,
    item,
    currentItemId,
    onClick,
    baseRoute,
}) => {
    if (!isMusicItem(item)) {
        return (
            <StyledCategory>{startCase(item.type)}</StyledCategory>
        );
    } else {
        if (item.musicFiles.length === 1) {
            const musicFile = item.musicFiles[0];
            return (
                <StyledMusicItem>
                    <Link
                        to={path.normalize(`${baseRoute}/${getLastName(item.composer)}/${normalizeString(item.piece)}${musicFile.name ? '/' + normalizeString(musicFile.name) : ''}`)}
                        onClick={async () => {
                            try {
                                await onClick(musicFile);
                                play();
                            } catch (e) {
                                // already loading track;
                            }
                        }}
                    >
                        <Highlight active={currentItemId === musicFile.id}>
                            <StyledInfo>
                                <TextLeft>
                                    {getComposerTitleYear(item.composer, item.piece, item.year)}
                                </TextLeft>
                                <TextRight>
                                    {formatTime(musicFile.durationSeconds)}
                                </TextRight>
                            </StyledInfo>
                        </Highlight>
                    </Link>
                </StyledMusicItem>
            );
        } else {
            return (
                <StyledCollectionContainer>
                    <StyledCollectionTitleContainer>
                        <StyledInfo>
                            <h4 className={h4style}>{getComposerTitleYear(item.composer, item.piece, item.year)}</h4>
                        </StyledInfo>
                    </StyledCollectionTitleContainer>
                    <StyledCollectionList>
                        {item.musicFiles.map((musicFile, index) => (
                            <StyledCollectionItem
                                key={index}
                            >
                                <Link
                                    to={path.normalize(`${baseRoute}/${getLastName(item.composer)}/${normalizeString(item.piece)}/${normalizeString(musicFile.name)}`)}
                                    onClick={async () => {
                                        try {
                                            await onClick(musicFile);
                                            play();
                                        } catch (e) {
                                            console.debug('onClick no effect because already loading track');
                                        }
                                    }}
                                >
                                    <Highlight active={currentItemId === musicFile.id}>

                                        <StyledInfo>
                                            <TextLeft>
                                                {musicFile.name}
                                            </TextLeft>
                                            <TextRight>
                                                {formatTime(musicFile.durationSeconds)}
                                            </TextRight>
                                        </StyledInfo>
                                    </Highlight>
                                </Link>
                            </StyledCollectionItem>
                        ))}
                    </StyledCollectionList>
                </StyledCollectionContainer>
            );
        }
    }
};

export default MusicPlaylistItem;
