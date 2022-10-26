import * as React from 'react';

import styled from '@emotion/styled';

import PhotoFader from 'src/components/Media/Photos/PhotoFader';
import PhotoList from 'src/components/Media/Photos/PhotoList';

import { fetchPhotos, selectFirstPhoto, selectPhoto } from 'src/components/Media/Photos/reducers';
import { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem } from 'src/components/Media/Photos/utils';

import { lato1 } from 'src/styles/fonts';
import { pushed } from 'src/styles/mixins';
import { screenM, screenXS, screenPortrait } from 'src/screens';
import { playlistContainerWidth } from 'src/styles/variables';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { TransitionGroup } from 'react-transition-group';
import { MediaContext } from 'src/components/App/App';
import { toMedia } from 'src/mediaQuery';

const StyledPhotos = styled.div`
    ${pushed}
    width: 100%;
    background-color: black;
    position: relative;

    ${toMedia([screenXS, screenPortrait])} {
        height: 100%;
        margin-top: 0;
        overflow-y: hidden;
    }
`;

const StyledPhotoViewer = styled.div`
    position: relative;
    width: calc(100% - ${playlistContainerWidth.desktop});
    height: 100%;

    ${toMedia(screenM)} {
        width: calc(100% - ${playlistContainerWidth.tablet});
    }

    img {
        position: absolute;
        max-width: 100%;
        max-height: 100%;
        left: 50%;
        top: 50%;
        transform: translate3d(-50%, -50%, 0);
    }
`;

const StyledCredit = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;
    font-family: ${lato1};
    color: white;
    padding: 20px;
`;

const Photos: React.FC<Record<never, unknown>> = () => {
    const { isHamburger } = React.useContext(MediaContext);
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

    const selectPhotoCallback = (photo: PhotoItem) => {
        dispatch(selectPhoto(photo));
    };

    const isCurrentItem = (item: PhotoItem) =>
        currentItem && idFromItem(item) === idFromItem(currentItem);

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
