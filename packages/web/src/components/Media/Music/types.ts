export interface MusicItem {
    readonly id: string;
    readonly piece: string;
    readonly composer: string;
    readonly contributors?: string;
    readonly type: MusicCategories;
    readonly year?: number;
    readonly musicFiles: MusicFileItem[];
}

export interface MusicFileItem {
    readonly id: string;
    readonly name: string;
    readonly audioFile: string;
    readonly waveformFile: string;
    readonly durationSeconds: number;
    readonly music: string;
    readonly composer?: string;
    readonly piece?: string;
    readonly contributors?: string;
    readonly year?: number;
    readonly hash: string;
}

export const musicCategories = [
    'concerto',
    'solo',
    'chamber',
    'composition',
    'videogame',
] as const;

export type MusicCategories = typeof musicCategories[number];

export const categoryMap = {
    concerto: 'Concerti',
    solo: 'Solo Works',
    chamber: 'Chamber Works',
    composition: 'Original Compositions',
    videogame: 'Videogame-Inspired Works',
};

export interface MusicCategoryItem {
    readonly id: MusicCategories;
    readonly type: MusicCategories;
}

export interface MusicResponse {
    [k: string]: MusicItem[];
}

export type MusicListItem = MusicItem | MusicCategoryItem;

export const isMusicItem = (item: MusicListItem): item is MusicItem => {
    const test = item as MusicItem;
    return !!(
        test.piece ||
        test.composer ||
        test.contributors ||
        test.musicFiles
    );
};

export interface AudioPlaylistStateShape {
    readonly isFetching: boolean;
    readonly items: MusicListItem[];
    readonly flatItems: MusicFileItem[];
}
