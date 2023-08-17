export interface PhotoListReducerShape {
    items: PhotoItem[];
    isFetching: boolean;
    background: string;
}

export interface PhotoViewerReducerShape {
    currentItem?: PhotoItem;
}

export interface PhotoItem {
    file: string;
    credit: string;
    dateTaken: string;
    width: number;
    height: number;
    thumbnailWidth: number;
    thumbnailHeight: number;
}
