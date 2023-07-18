import Photos from 'src/components/Media/Photos/Photos';
import * as photos from 'src/components/Media/Photos/reducers';

export const Component = Photos;
export const reducers = {
    photoList: photos.photoListReducer,
    photoViewer: photos.photoViewerReducer,
};
