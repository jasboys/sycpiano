import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';
import { Link } from 'react-router-dom';

import {
    categoryMap,
    isMusicItem,
    MusicFileItem,
    MusicItem as MusicItemType,
    MusicListItem,
} from 'src/components/Media/Music/types';
import {
    formatTime,
    getRelativePermaLink,
} from 'src/components/Media/Music/utils';
import { useAppDispatch, useAppSelector } from 'src/hooks.js';
import { lightBlue, playlistBackground } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts.js';
import { updateAction } from './reducers.js';

interface MusicPlaylistItemProps {
    readonly item: MusicListItem;
    readonly onClick: (track: MusicFileItem, fade?: boolean) => void;
}

const baseItemStyle = css(latoFont(300), {
    backgroundColor: playlistBackground,
    listStyle: 'none',
    cursor: 'pointer',
    width: '100%',
    '&:hover': {
        backgroundColor: 'white',
    },
});

const StyledMusicItem = styled.li(baseItemStyle);

const StyledCollectionItem = styled.li(baseItemStyle, {
    marginLeft: '15px',
    width: 'auto',
    border: 'none',
});

interface HighlightProps {
    active: boolean;
}

const Highlight = styled.div<HighlightProps>(({ active }) => ({
    padding: '10px 10px 10px 15px',
    borderLeft: `7px solid ${active ? lightBlue : 'transparent'}`,
    transition: 'all 0.15s',
}));

const section = css({
    verticalAlign: 'middle',
    display: 'inline-block',
});

const h4style = css({
    margin: 0,
    color: 'black',
    fontSize: '0.9rem',
    display: 'inline-block',
    lineHeight: '1rem',
});

const TextLeft = styled.span(h4style);

const TextRight = styled.span(h4style, {
    margin: '0 0 0 10px',
    fontSize: '0.75rem',
});

const StyledCollectionContainer = styled.li({ padding: '10px 0' });

const StyledCollectionList = styled.ul({ padding: 0 });

const StyledCollectionTitleContainer = styled.div({
    position: 'relative',
    height: '100%',
    backgroundColor: playlistBackground,
    padding: '10px 10px 10px 22px',
});

const StyledInfo = styled.div(latoFont(300), section, {
    width: '100%',
    height: '100%',
    position: 'relative',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    [`${StyledCollectionItem} &, ${StyledCollectionTitleContainer} &`]: {
        padding: 0,
    },
});

const StyledCategory = styled.div(latoFont(300), {
    backgroundColor: '#eee',
    padding: '12px 0 12px 22px',
    fontSize: '1.2rem',
    position: 'relative',
    zIndex: 5,
    boxShadow: '0 2px 6px -2px rgba(0, 0, 0, 0.5)',
});

const getComposerTitleYear = (
    composer: string,
    piece: string,
    year?: number,
) => {
    const compStr = composer === 'Sean Chen' ? '' : `${composer} `;
    const yearStr = year ? ` (${year})` : '';
    return `${compStr}${piece}${yearStr}`;
};

interface MusicItemProps extends MusicPlaylistItemProps {
    item: MusicItemType;
}

const MusicItem: React.FC<MusicItemProps> = ({ item, onClick }) => {
    const currentTrack = useAppSelector(
        ({ musicPlayer }) => musicPlayer.currentTrack,
    );
    const dispatch = useAppDispatch();

    const musicFile = item.musicFiles[0];
    return (
        <StyledMusicItem id={musicFile.id}>
            <Link
                to={getRelativePermaLink(
                    item.composer,
                    item.piece,
                    musicFile.name,
                )}
                onClick={async () => {
                    // dispatch(updateAction({ playing: true }));
                    try {
                        onClick(musicFile);
                        dispatch(updateAction({ playing: true }));
                    } catch (e) {
                        // already loading track;
                    }
                }}
            >
                <Highlight active={currentTrack?.id === musicFile.id}>
                    <StyledInfo>
                        <TextLeft>
                            {getComposerTitleYear(
                                item.composer,
                                item.piece,
                                item.year,
                            )}
                        </TextLeft>
                        <TextRight>
                            {formatTime(musicFile.durationSeconds)}
                        </TextRight>
                    </StyledInfo>
                </Highlight>
            </Link>
        </StyledMusicItem>
    );
};

const MusicCollectionItem: React.FC<
    MusicItemProps & { index: number; musicFile: MusicFileItem }
> = ({ item, onClick, index, musicFile }) => {
    const currentTrack = useAppSelector(
        ({ musicPlayer }) => musicPlayer.currentTrack,
    );
    const dispatch = useAppDispatch();

    return (
        <StyledCollectionItem key={index} id={musicFile.id}>
            <Link
                to={getRelativePermaLink(
                    item.composer,
                    item.piece,
                    musicFile.name,
                )}
                onClick={async () => {
                    try {
                        onClick(musicFile);
                        dispatch(updateAction({ playing: true }));
                    } catch (e) {
                        // already loading track;
                    }
                }}
            >
                <Highlight active={currentTrack?.id === musicFile.id}>
                    <StyledInfo>
                        <TextLeft>{musicFile.name}</TextLeft>
                        <TextRight>
                            {formatTime(musicFile.durationSeconds)}
                        </TextRight>
                    </StyledInfo>
                </Highlight>
            </Link>
        </StyledCollectionItem>
    );
};

const MusicCollection: React.FC<MusicItemProps> = ({ item, ...props }) => {
    return (
        <StyledCollectionContainer>
            <StyledCollectionTitleContainer>
                <StyledInfo>
                    <TextLeft>
                        {getComposerTitleYear(
                            item.composer,
                            item.piece,
                            item.year,
                        )}
                    </TextLeft>
                </StyledInfo>
            </StyledCollectionTitleContainer>
            <StyledCollectionList>
                {item.musicFiles.map((musicFile, index) => (
                    <MusicCollectionItem
                        item={item}
                        index={index}
                        key={musicFile.id}
                        musicFile={musicFile}
                        {...props}
                    />
                ))}
            </StyledCollectionList>
        </StyledCollectionContainer>
    );
};

const MusicPlaylistItem: React.FC<MusicPlaylistItemProps> = (props) => {
    const { item } = props;

    if (!isMusicItem(item)) {
        return <StyledCategory>{categoryMap[item.type]}</StyledCategory>;
    }
    if (item.musicFiles.length === 1) {
        return <MusicItem {...props} item={item} />;
    }
    return <MusicCollection {...props} item={item} />;
};

const MemoizedPlaylistItem = React.memo(MusicPlaylistItem);

export default MemoizedPlaylistItem;
