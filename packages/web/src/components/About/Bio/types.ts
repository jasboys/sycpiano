export interface Blurb {
    paragraph: number;
    text: string;
}

export interface BioStateShape {
    isFetching: boolean;
    bio: Blurb[];
}
