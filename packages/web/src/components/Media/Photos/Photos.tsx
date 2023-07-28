import * as React from 'react';

import styled from '@emotion/styled';

import PhotoFader from 'src/components/Media/Photos/PhotoFader';
import PhotoList from 'src/components/Media/Photos/PhotoList';

import { fetchPhotos, selectFirstPhoto, selectPhoto } from 'src/components/Media/Photos/reducers';
import { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem } from 'src/components/Media/Photos/utils';

import { latoFont } from 'src/styles/fonts';
import { pushed } from 'src/styles/mixins';
import { screenXS, screenPortrait } from 'src/screens';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { TransitionGroup } from 'react-transition-group';
import { toMedia } from 'src/MediaQuery';
import { mqSelectors } from 'src/components/App/reducers';

const StyledPhotos = styled.div(
    pushed,
    {
        width: '100%',
        backgroundColor: 'rgb(248 248 248)',
        position: 'relative',
        [toMedia([screenXS, screenPortrait])]: {
            height: '100%',
            marginTop: 0,
            overflowY: 'hidden',
        },
    },
);

const StyledPhotoViewer = styled.div({
    position: 'absolute',
    left: 0,
    width: `calc(100vw - 300px)`,
    height: '100%',
    justifyContent: 'center',
    display: 'flex',
    textAlign: 'center',
    zIndex: 3,

    img: {
        maxWidth: '100%',
        maxHeight: '100%',
    }
});

const StyledCredit = styled.div(
    latoFont(200),
    {
        position: 'absolute',
        bottom: 0,
        color: 'black',
        padding: 20,
    });

const Photos: React.FC<Record<never, unknown>> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const dispatch = useAppDispatch();
    const currentItem = useAppSelector(({ photoViewer }) => photoViewer.currentItem);
    const items = useAppSelector(({ photoList }) => photoList.items);

    React.useEffect(() => {
        async function callDispatch() {
            await dispatch(fetchPhotos());
            dispatch(selectFirstPhoto());
        }

        callDispatch();
        // dispatch(fetchPhotos());
    }, []);

    const selectPhotoCallback = React.useCallback((photo: PhotoItem) => {
        dispatch(selectPhoto(photo));
    }, []);

    const isCurrentItem = React.useCallback((item: PhotoItem) => {
        return currentItem && idFromItem(item) === idFromItem(currentItem);
    }, [currentItem]);

    // const scrollLinkCallback = React.useCallback((ev: React.UIEvent<HTMLDivElement, UIEvent>) => {
    //     const curr = ref.current;
    //     if (!curr) {
    //         return;
    //     }
    //     const currentTop = curr.scrollTop;
    //     const delta = currentTop - prevPlaylistScrollTop;


    // }, []);

    return (
        <StyledPhotos>
            {!isHamburger && (
                <StyledPhotoViewer>
                    <TransitionGroup component={null}>
                        {items.map((item, idx) => {
                            const isCurrent = isCurrentItem(item);
                            return (
                                <PhotoFader key={idx} idx={idx} item={item} isCurrent={isCurrent} isMobile={isHamburger} />
                            );

                        })}
                    </TransitionGroup>
                    {currentItem && <StyledCredit>{`credit: ${currentItem.credit}`}</StyledCredit>}
                </StyledPhotoViewer>
            )}
            <PhotoList
                items={items}
                currentItem={currentItem}
                selectPhoto={selectPhotoCallback}
            />
        </StyledPhotos>
    );
};

export type PhotosType = typeof Photos;
export type RequiredProps = Record<never, unknown>;
export default Photos;
