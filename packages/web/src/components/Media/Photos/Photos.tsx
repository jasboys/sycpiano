import styled from '@emotion/styled';
import * as React from 'react';
import { TransitionGroup } from 'react-transition-group';

import { format, parseISO } from 'date-fns';
import { readableColor } from 'polished';
import PhotoFader from 'src/components/Media/Photos/PhotoFader';
import PhotoList from 'src/components/Media/Photos/PhotoList';
import { photoStore } from 'src/components/Media/Photos/store';
import type { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem } from 'src/components/Media/Photos/utils';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts';
import { pushed } from 'src/styles/mixins';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useStore } from 'src/store.js';

const StyledPhotos = styled.div(pushed, {
    width: '100%',
    backgroundColor: 'rgb(248 248 248)',
    position: 'relative',
    transition: 'background 0.5s',
    [toMedia([screenXS, screenPortrait])]: {
        height: '100%',
        marginTop: 0,
        overflowY: 'hidden',
    },
});

const StyledPhotoViewer = styled.div({
    position: 'absolute',
    left: 0,
    width: 'calc(100vw - 300px)',
    height: '100%',
    justifyContent: 'center',
    display: 'flex',
    textAlign: 'center',
    zIndex: 3,

    img: {
        maxWidth: '100%',
        maxHeight: '100%',
    },
});

const StyledCredit = styled.div(latoFont(200), {
    position: 'absolute',
    bottom: 0,
    padding: 20,
});

const Photos: React.FC<Record<never, unknown>> = () => {
    const screenXS = useStore().mediaQueries.screenXS();
    const currentItem = photoStore.use.currentItem?.();
    const background = photoStore.use.background();

    const { data: photos } = useQuery({
        queryKey: ['photos'],
        queryFn: async () => {
            const { data } = await axios.get<PhotoItem[]>('/api/photos');
            return data;
        },
    });

    React.useEffect(() => {
        if (photos?.length) {
            photoStore.set.currentItem?.(photos[0]);
        }
    }, [photos]);

    const selectPhotoCallback = React.useCallback((photo: PhotoItem) => {
        photoStore.set.currentItem?.(photo);
    }, []);

    const isCurrentItem = React.useCallback(
        (item: PhotoItem) => {
            return currentItem && idFromItem(item) === idFromItem(currentItem);
        },
        [currentItem],
    );

    const endColorMatches = background.match(/(#[0-9a-f]{6})\)$/i);
    const lastColor = endColorMatches?.[1] ?? 'rgb(248 248 248)';

    return (
        <StyledPhotos style={{ background }}>
            {!screenXS && (
                <StyledPhotoViewer>
                    <TransitionGroup component={null}>
                        {photos?.map((item, idx) => {
                            const isCurrent = isCurrentItem(item);
                            return (
                                <PhotoFader
                                    key={item.file}
                                    idx={idx}
                                    item={item}
                                    isCurrent={isCurrent}
                                    isMobile={screenXS}
                                />
                            );
                        })}
                    </TransitionGroup>
                    {(currentItem?.credit || currentItem?.dateTaken) && (
                        <StyledCredit
                            style={{ color: readableColor(lastColor) }}
                        >{`${
                            currentItem.credit
                                ? `credit: ${currentItem.credit}`
                                : ''
                        }${
                            currentItem.credit && currentItem.dateTaken
                                ? ' | '
                                : ''
                        }${
                            currentItem.dateTaken
                                ? format(
                                      parseISO(currentItem.dateTaken),
                                      'yyyy',
                                  )
                                : ''
                        }`}</StyledCredit>
                    )}
                </StyledPhotoViewer>
            )}
            {photos && (
                <PhotoList
                    items={photos}
                    currentItem={currentItem}
                    selectPhoto={selectPhotoCallback}
                />
            )}
        </StyledPhotos>
    );
};

export type PhotosType = typeof Photos;
export type RequiredProps = Record<never, unknown>;
export default Photos;
