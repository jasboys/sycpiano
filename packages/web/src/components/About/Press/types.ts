export interface AcclaimItemShape {
    readonly id: string;
    readonly quote: string;
    readonly date: string;
    readonly short: string;
    readonly author: string;
    readonly shortAuthor: string;
    readonly hasFullDate: boolean;
    readonly website?: string;
}

export interface AcclaimsListStateShape {
    readonly isFetching: boolean;
    readonly items: AcclaimItemShape[];
}
