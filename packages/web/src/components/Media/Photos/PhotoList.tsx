import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useAtomValue, useSetAtom } from 'jotai';
import type * as React from 'react';
import { navBarActions } from 'src/components/App/NavBar/store';
import { mediaQueriesAtoms } from 'src/components/App/store';

import DropboxButton from 'src/components/Media/Photos/DropboxButton';
import PhotoListItem from 'src/components/Media/Photos/PhotoListItem';
import type { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem } from 'src/components/Media/Photos/utils';
import Playlist from 'src/components/Media/Playlist';
import { toMedia } from 'src/mediaQuery';
import { minRes, screenPortrait, screenXS, webkitMinDPR } from 'src/screens';
import { navBarHeight } from 'src/styles/variables';

const photoListStyle = css({
    paddingLeft: 5,
    backgroundColor: 'transparent',
    top: 0,
    width: 300,

    [toMedia([screenXS, screenPortrait])]: {
        paddingLeft: 0,
    },
});

const photoULStyle = css({
    paddingBottom: 80,
    backgroundColor: 'transparent',
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
    const screenXS = useAtomValue(mediaQueriesAtoms.screenXS);
    const hiDpx = useAtomValue(mediaQueriesAtoms.hiDpx);
    const onScroll = useSetAtom(navBarActions.onScroll);

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
                    screenXS
                        ? (ev) => onScroll(navBarHeight.get(hiDpx), ev)
                        : undefined
                }
            >
                {items.map((item) => (
                    <PhotoListItem
                        key={item.file}
                        item={item}
                        isMobile={screenXS}
                        currentItemId={
                            screenXS ? undefined : idFromItem(currentItem)
                        }
                        onClick={screenXS ? undefined : selectPhoto}
                    />
                ))}
            </Playlist>
            <DropboxButton />
        </StyledPhotoListContainer>
    );
};

export default PhotoList;
