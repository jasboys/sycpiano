
export interface PhotoListReducerShape {
    items: PhotoItem[];
    isFetching: boolean;
}

export interface PhotoViewerReducerShape {
    currentItem?: PhotoItem;
}

export interface PhotoItem {
    file: string;
    credit: string;
    width: number;
    height: number;
    thumbnailWidth: number;
    thumbnailHeight: number;
}
