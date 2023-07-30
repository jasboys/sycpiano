import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as React from 'react';

import { toMedia } from 'src/MediaQuery';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import { mqSelectors } from 'src/components/App/reducers';
import DropboxButton from 'src/components/Media/Photos/DropboxButton';
import PhotoListItem from 'src/components/Media/Photos/PhotoListItem';
import { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem } from 'src/components/Media/Photos/utils';
import Playlist from 'src/components/Media/Playlist';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { minRes, screenPortrait, screenXS, webkitMinDPR } from 'src/screens';
import { navBarHeight } from 'src/styles/variables';

const photoListStyle = css({
    paddingLeft: 5,
    backgroundColor: 'rgb(248 248 248)',
    top: 0,
    width: 300,

    [toMedia([screenXS, screenPortrait])]: {
        paddingLeft: 0,
    }
});

const photoULStyle = css({
    paddingBottom: 80,
    backgroundColor: 'rgb(248 248 248)',
    [toMedia([minRes, webkitMinDPR])]: {
        paddingTop: navBarHeight.hiDpx,
        backgroundColor: 'unset',
        paddingBottom: 60,
    },
});

const playlistExtraStyles = {
    div: photoListStyle,
    ul: photoULStyle,
};

const StyledPhotoListContainer = styled.div({
    width: 'fit-content',
    height: '100%',
    right: 0,
    top: 0,
    position: 'absolute',
    [toMedia([screenXS, screenPortrait])]: {
        width: '100%',
        height: 'auto',
        right: 'unset',
        top: 'unset',
        position: 'unset',
    },
});

interface PhotoListProps {
    items: PhotoItem[];
    currentItem?: PhotoItem;
    selectPhoto: (item: PhotoItem) => void;
    ref?: React.ForwardedRef<HTMLElement | null>;
}

const PhotoList: React.FC<PhotoListProps> = (props) => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const hiDpx = useAppSelector(mqSelectors.hiDpx);
    const dispatch = useAppDispatch();

    const onScrollDispatch = React.useCallback(
        (triggerHeight: number, scrollTop: number) => {
            dispatch(onScroll({ triggerHeight, scrollTop }));
        },
        [],
    );

    const { items, currentItem, selectPhoto } = props;
    return (
        <StyledPhotoListContainer>
            <Playlist
                ref={props.ref}
                id="photos_ul"
                extraStyles={playlistExtraStyles}
                hasToggler={false}
                isShow={true}
                shouldAppear={false}
                onScroll={
                    isHamburger
                        ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch)
                        : undefined
                }
            >
                {items.map((item) => (
                    <PhotoListItem
                        key={item.file}
                        item={item}
                        isMobile={isHamburger}
                        currentItemId={
                            isHamburger ? undefined : idFromItem(currentItem)
                        }
                        onClick={isHamburger ? undefined : selectPhoto}
                    />
                ))}
            </Playlist>
            <DropboxButton />
        </StyledPhotoListContainer>
    );
};

export default PhotoList;