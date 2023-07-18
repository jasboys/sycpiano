export interface DiscLink {
    type: string;
    url: string;
}

export interface Disc {
    id: string;
    title: string;
    description: string;
    label: string;
    releaseDate: number;
    thumbnailFile: string;
    discLinks: DiscLink[];
}

export interface DiscsStateShape {
    isFetching: boolean;
    discs: Disc[];
}
