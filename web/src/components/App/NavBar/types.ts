export interface LinkBaseShape {
    readonly name: string;
    readonly path?: string;
}

export interface LinkShape extends LinkBaseShape {
    readonly name: string;
    readonly path?: string;
    readonly subLinks?: LinkShape[];
}

export interface NavBarLinksProps {
    readonly className?: string;
    readonly currentBasePath: string;
    readonly isMobile: boolean;
}

export interface NavBarStateShape {
    readonly isVisible: boolean;
    readonly isExpanded: boolean;
    readonly showSubs: string[];
    readonly lastScrollTop: number;
    // readonly onScroll?: (event: React.SyntheticEvent<HTMLElement> | UIEvent) => void;
}
