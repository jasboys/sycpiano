import { BioStateShape } from 'src/components/About/Bio/types';
import { DiscsStateShape } from 'src/components/About/Discs/types';
import { AcclaimsListStateShape } from 'src/components/About/Press/types';
import { NavBarStateShape } from 'src/components/App/NavBar/types';
import { AudioPlaylistStateShape } from 'src/components/Media/Music/types';
import { PhotoListReducerShape, PhotoViewerReducerShape } from 'src/components/Media/Photos/types';
import { VideoPlayerStateShape, VideoPlaylistStateShape } from 'src/components/Media/Videos/types';
import { ScheduleStateShape } from 'src/components/Schedule/types';
import { ShopStateShape } from './components/Shop/ShopList/types';

import { bioReducer } from 'src/components/About/Bio/reducers';
import { discsReducer } from 'src/components/About/Discs/reducers';
import { acclaimsListReducer } from 'src/components/About/Press/reducers';
import { audioPlaylistReducer } from 'src/components/Media/Music/reducers';
import { photoListReducer, photoViewerReducer } from 'src/components/Media/Photos/reducers';
import { videoPlayerReducer, videoPlaylistReducer } from 'src/components/Media/Videos/reducers';
import { scheduleReducer } from 'src/components/Schedule/reducers';
import { shopReducer } from 'src/components/Shop/ShopList/reducers';

import { Store } from 'redux';
import { CartStateShape } from './components/Cart/types';
import { cartReducer } from './components/Cart/reducers';
import { ComponentType } from 'react';
import { AppDispatch, GlobalStateShape } from 'src/store';
import { GLOBAL_QUERIES } from './screens';
import { CSSVariables } from 'src/styles/variables';
import { colorVars } from 'src/styles/colors';
import { mediaQueryReducer } from './components/App/reducers';

export type MediaQueryStateShape = Record<keyof typeof GLOBAL_QUERIES, boolean>;

export type AnyStateShape = BioStateShape |
    DiscsStateShape |
    AudioPlaylistStateShape |
    PhotoListReducerShape |
    PhotoViewerReducerShape |
    AcclaimsListStateShape |
    ScheduleStateShape |
    ShopStateShape |
    VideoPlayerStateShape |
    VideoPlaylistStateShape |
    NavBarStateShape |
    CartStateShape |
    MediaQueryStateShape;

export interface IndexableGlobalStateShape extends GlobalStateShape {
    [key: string]: AnyStateShape | undefined;
}

export type AnyReducerType = typeof bioReducer | typeof discsReducer | typeof audioPlaylistReducer |
    typeof photoListReducer | typeof photoViewerReducer | typeof acclaimsListReducer | typeof cartReducer |
    typeof scheduleReducer | typeof videoPlayerReducer | typeof videoPlaylistReducer | typeof shopReducer |
    typeof mediaQueryReducer;

export interface Reducers {
    readonly bio: typeof bioReducer;
    readonly discs: typeof discsReducer;
    readonly audioPlaylist: typeof audioPlaylistReducer;
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
    dispatch: AppDispatch
    state: GlobalStateShape
}

export type StaticReducers = Pick<GlobalStateShape, 'shop' | 'navbar' | 'cart' | 'mediaQuery'>;

// export type AnyComponent<P> = React.ComponentClass<P> | React.FunctionComponent<P>;
export type DynamicReducers = Omit<GlobalStateShape, keyof StaticReducers>;

export type AsyncStore = Omit<Store<GlobalStateShape>, keyof StaticReducers> & { async?: Partial<Reducers> };
export type IndexableAsyncStore = Store<IndexableGlobalStateShape> & { async?: Reducers };

export interface AsyncModule<P> {
    Component: ComponentType<P>;
    reducers?: Partial<Reducers>;
}

export interface FloatingRefStructure {
    readonly arrow: HTMLDivElement | null;
    readonly floating: HTMLDivElement | null;
}

export type CSSVariableKeys = keyof typeof CSSVariables | keyof typeof colorVars;
