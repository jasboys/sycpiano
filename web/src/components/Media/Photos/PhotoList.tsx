import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';

import DropboxButton from 'src/components/Media/Photos/DropboxButton';
import PhotoListItem from 'src/components/Media/Photos/PhotoListItem';
import { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem } from 'src/components/Media/Photos/utils';
import Playlist from 'src/components/Media/Playlist';
import { screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';

const photoListStyle = css`
    padding-left: 5px;
    background-color: black;
    top: 0;

    ${screenXSorPortrait} {
        padding-left: 0;
    }
`;

const photoULStyle = css`
    padding-bottom: 80px;
    background-color: black;

    ${screenXSorPortrait} {
        padding-top: ${navBarHeight.mobile}px;
        background-color: unset;
        padding-bottom: 60px;
    }
`;

const playlistExtraStyles = ({
    div: photoListStyle,
    ul: photoULStyle,
});

const StyledPhotoListContainer = styled.div`
    width: fit-content;
    height: 100%;
    right: 0;
    top: 0;
    position: absolute;

    ${screenXSorPortrait} {
        width: 100%;
        height: auto;
        right: unset;
        top: unset;
        position: unset;
    }
`;

interface PhotoListProps {
    isMobile: boolean;
    items: PhotoItem[];
    currentItem?: PhotoItem;
    selectPhoto: (item: PhotoItem) => void;
}

const PhotoList: React.FC<PhotoListProps> = (props) => {
    const dispatch = useAppDispatch();

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };


    const {
        isMobile,
        items,
        currentItem,
        selectPhoto,
    } = props;
    return (
        <StyledPhotoListContainer>
            <Playlist
                id="photos_ul"
                extraStyles={playlistExtraStyles}
                hasToggler={false}
                isShow={true}
                shouldAppear={false}
                isMobile={isMobile}
                onScroll={isMobile ? scrollFn(navBarHeight.mobile, onScrollDispatch) : undefined}
            >
                {items.map((item) => (
                    <PhotoListItem
                        key={item.file}
                        item={item}
                        currentItemId={isMobile ? undefined : idFromItem(currentItem)}
                        onClick={isMobile ? undefined : selectPhoto}
                        isMobile={isMobile}
                    />
                ))}
            </Playlist>
            <DropboxButton />
        </StyledPhotoListContainer>
    );
};

export default PhotoList;