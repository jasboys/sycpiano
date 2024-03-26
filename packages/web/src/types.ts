import type { BioStateShape } from 'src/components/About/Bio/types';
import type { DiscsStateShape } from 'src/components/About/Discs/types';
import type { AcclaimsListStateShape } from 'src/components/About/Press/types';
import type { NavBarStateShape } from 'src/components/App/NavBar/types';
import type { MusicStateShape } from 'src/components/Media/Music/types';
import type {
    PhotoListReducerShape,
    PhotoViewerReducerShape,
} from 'src/components/Media/Photos/types';
import type {
    VideoPlayerStateShape,
    VideoPlaylistStateShape,
} from 'src/components/Media/Videos/types';
import type { ScheduleStateShape } from 'src/components/Schedule/types';
import type { ShopStateShape } from 'src/components/Shop/ShopList/types';

import type { bioReducer } from 'src/components/About/Bio/reducers';
import type { discsReducer } from 'src/components/About/Discs/reducers';
import type { acclaimsListReducer } from 'src/components/About/Press/reducers';
import type { musicPlayerReducer } from 'src/components/Media/Music/reducers';
import type {
    photoListReducer,
    photoViewerReducer,
} from 'src/components/Media/Photos/reducers';
import type {
    videoPlayerReducer,
    videoPlaylistReducer,
} from 'src/components/Media/Videos/reducers';
import type { scheduleReducer } from 'src/components/Schedule/reducers';
import type { shopReducer } from 'src/components/Shop/ShopList/reducers';

import type { ComponentType } from 'react';
import type { Store } from 'redux';
import type { cartReducer } from 'src/components/Cart/reducers';
import type { CartStateShape } from 'src/components/Cart/types';
import type { GLOBAL_QUERIES } from 'src/screens';
import type { AppDispatch, GlobalStateShape } from 'src/store';
import type { colorVars } from 'src/styles/colors';
import type { CSSVariables } from 'src/styles/variables';
import type { mediaQueryReducer } from './components/App/reducers';

export type MediaQueryStateShape = Record<keyof typeof GLOBAL_QUERIES, boolean>;

export type AnyStateShape =
    | BioStateShape
    | DiscsStateShape
    | MusicStateShape
    | PhotoListReducerShape
    | PhotoViewerReducerShape
    | AcclaimsListStateShape
    | ScheduleStateShape
    | ShopStateShape
    | VideoPlayerStateShape
    | VideoPlaylistStateShape
    | NavBarStateShape
    | CartStateShape
    | MediaQueryStateShape;

export interface IndexableGlobalStateShape extends GlobalStateShape {
    [key: string]: AnyStateShape | undefined;
}

export interface FullState {
    readonly bio: BioStateShape;
    readonly discs: DiscsStateShape;
    readonly musicPlayer: MusicStateShape;
    readonly photoList: PhotoListReducerShape;
    readonly photoViewer: PhotoViewerReducerShape;
    readonly pressAcclaimsList: AcclaimsListStateShape;
    readonly scheduleEventItems: ScheduleStateShape;
    readonly videoPlayer: VideoPlayerStateShape;
    readonly videoPlaylist: VideoPlaylistStateShape;
    readonly mediaQuery: MediaQueryStateShape;
    readonly shop: ShopStateShape;
    readonly cart: CartStateShape;
    readonly navbar: NavBarStateShape;
}

export type AnyReducerType =
    | typeof bioReducer
    | typeof discsReducer
    | typeof musicPlayerReducer
    | typeof photoListReducer
    | typeof photoViewerReducer
    | typeof acclaimsListReducer
    | typeof cartReducer
    | typeof scheduleReducer
    | typeof videoPlayerReducer
    | typeof videoPlaylistReducer
    | typeof shopReducer
    | typeof mediaQueryReducer;

export interface Reducers {
    readonly bio: typeof bioReducer;
    readonly discs: typeof discsReducer;
    readonly musicPlayer: typeof musicPlayerReducer;
    readonly photoList: typeof photoListReducer;
    readonly photoViewer: typeof photoViewerReducer;
    readonly pressAcclaimsList: typeof acclaimsListReducer;
    readonly scheduleEventItems: typeof scheduleReducer;
    readonly videoPlayer: typeof videoPlayerReducer;
    readonly videoPlaylist: typeof videoPlaylistReducer;
    readonly mediaQuery: typeof mediaQueryReducer;
    readonly [key: string]: AnyReducerType | undefined;
}

export interface ThunkAPIType {
    dispatch: AppDispatch;
    state: GlobalStateShape;
}

export type StaticReducers = Pick<
    GlobalStateShape,
    'shop' | 'navbar' | 'cart' | 'mediaQuery'
>;

// export type AnyComponent<P> = React.ComponentClass<P> | React.FunctionComponent<P>;
export type DynamicReducers = Omit<GlobalStateShape, keyof StaticReducers>;

export type AsyncStore = Omit<Store<GlobalStateShape>, keyof StaticReducers> & {
    async?: Partial<Reducers>;
};
export type IndexableAsyncStore = Store<IndexableGlobalStateShape> & {
    async?: Reducers;
};

export interface AsyncModule<P> {
    Component: ComponentType<P>;
    reducers?: Partial<Reducers>;
}

export interface FloatingRefStructure {
    readonly arrow: HTMLDivElement | null;
    readonly floating: HTMLDivElement | null;
}

export type CSSVariableKeys =
    | keyof typeof CSSVariables
    | keyof typeof colorVars;
