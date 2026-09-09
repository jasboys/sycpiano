export interface GCalEvent extends Record<string, unknown> {
    readonly description: string;
    readonly id: string;
    readonly location: string;
    readonly start: {
        readonly dateTime?: Date;
        readonly date?: Date;
        readonly timeZone?: string;
    };
    readonly summary: string;
}

export interface ShopItem {
    readonly description?: string | null;
    readonly id: string;
    readonly name: string;
    readonly price: number;
    readonly images?: string[];
    readonly format?: string;
    readonly pages?: number | null;
    readonly sample?: string | null;
    readonly permalink?: string | null;
}
