import type { SerializedStyles } from '@emotion/react';

export interface ChildRendererProps<T> {
    readonly key: number | string;
    readonly currentItemId?: number | string;
    readonly item: T;
    readonly onClick?: (...args: any[]) => void;
    readonly isMobile: boolean;
}

export interface PlaylistProps {
    readonly extraStyles?: {
        div?: SerializedStyles;
        ul?: SerializedStyles;
        toggler?: SerializedStyles;
    };
    readonly children?: React.ReactNode;
    readonly hasToggler: boolean;
    readonly isShow: boolean;
    readonly togglePlaylist?: (isShow?: boolean) => void;
    readonly shouldAppear: boolean;
    readonly id?: string;
    readonly onScroll?: (event: React.UIEvent<HTMLElement> | UIEvent) => void;
}
