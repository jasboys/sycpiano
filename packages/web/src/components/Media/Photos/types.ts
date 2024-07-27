export interface PhotoStoreShape {
    currentItem?: PhotoItem;
    background: string;
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
