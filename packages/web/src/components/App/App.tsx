import { Global } from '@emotion/react';
import styled from '@emotion/styled';
import { arrow, offset, shift, useFloating } from '@floating-ui/react-dom';
import { useMediaQueries } from '@react-hook/media-query';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { omit, startCase, toLower } from 'lodash-es';
import { parse, stringify } from 'qs';
import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useMatch,
    useNavigate,
    type PathMatch,
} from 'react-router-dom';
import { SwitchTransition, Transition } from 'react-transition-group';

import Container from 'src/components/App/Container';

import type { RequiredProps as BioProps } from 'src/components/About/Bio/Bio';
import type { RequiredProps as DiscsProps } from 'src/components/About/Discs/Discs';
import type { RequiredProps as PressProps } from 'src/components/About/Press/Press';
import type { RequiredProps as ContactProps } from 'src/components/Contact/Contact';
import type { RequiredProps as HomeProps } from 'src/components/Home/Home';
import type { RequiredProps as MusicProps } from 'src/components/Media/Music/Music';
import type { RequiredProps as PhotosProps } from 'src/components/Media/Photos/Photos';
import type { RequiredProps as VideosProps } from 'src/components/Media/Videos/Videos';
import type { RequiredProps as ScheduleProps } from 'src/components/Schedule/Schedule';
import type { RequiredProps as CheckoutSuccessProps } from 'src/components/Shop/CheckoutSuccess/CheckoutSuccess';
import type { RequiredProps as FAQsProps } from 'src/components/Shop/FAQs/FAQs';
import type { RequiredProps as RetrievalFormProps } from 'src/components/Shop/RetrievePurchases/RetrievePurchases';
import type { RequiredProps as ShopListProps } from 'src/components/Shop/ShopList/ShopList';

import NavBar from 'src/components/App/NavBar/NavBar';
import AsyncComponent from 'src/components/AsyncComponent';
import Cart from 'src/components/Cart/Cart';
import { ClickListenerOverlay } from 'src/components/ClickListenerOverlay';
import { LogoSVG } from 'src/components/LogoSVG';
import { eventListNamesArr } from 'src/components/Schedule/types';
import extractModule from 'src/module';
import { GLOBAL_QUERIES } from 'src/screens';
import { rootStore } from 'src/store.js';
import { globalCss } from 'src/styles/global';
import {
    fadeOnEnter,
    fadeOnExit,
    metaDescriptions,
    slideOnEnter,
    slideOnExit,
    titleStringBase,
} from 'src/utils';
import type { ProductMap } from '../Shop/ShopList/types.js';
import { mediaQueriesStore } from './store';

const register = extractModule();
const Contact = () =>
    register(
        'contact',
        import(/* webpackChunkName: 'contact' */ 'src/components/Contact'),
    );
const Home = () =>
    register(
        'home',
        import(/* webpackChunkName: 'home' */ 'src/components/Home'),
    );
const Schedule = () =>
    register(
        'schedule',
        import(/* webpackChunkName: 'schedule' */ 'src/components/Schedule'),
    );
const Page404 = () =>
    register(
        'page404',
        import(/* webpackChunkName: 'page404' */ 'src/components/Error'),
    );

const Bio = () =>
    register(
        'bio',
        import(/* webpackChunkName: 'bio' */ 'src/components/About/Bio'),
    );
const Press = () =>
    register(
        'press',
        import(/* webpackChunkName: 'press' */ 'src/components/About/Press'),
    );
const Discs = () =>
    register(
        'discs',
        import(/* webpackChunkName: 'discs' */ 'src/components/About/Discs'),
    );

const Music = () =>
    register(
        'music',
        import(/* webpackChunkName: 'music' */ 'src/components/Media/Music'),
    );
const Photos = () =>
    register(
        'photos',
        import(/* webpackChunkName: 'photos' */ 'src/components/Media/Photos'),
    );
const Videos = () =>
    register(
        'videos',
        import(/* webpackChunkName: 'videos' */ 'src/components/Media/Videos'),
    );

const ShopList = () =>
    register(
        'shop',
        import(/* webpackChunkName: 'shop' */ 'src/components/Shop/ShopList'),
    );
const RetrievalForm = () =>
    register(
        'retrievalForm',
        import(
            /* webpackChunkName: 'retrievalForm' */ 'src/components/Shop/RetrievePurchases'
        ),
    );
const FAQs = () =>
    register(
        'faqs',
        import(/* webpackChunkName: 'faqs' */ 'src/components/Shop/FAQs'),
    );
const CheckoutSuccess = () =>
    register(
        'checkoutSuccess',
        import(
            /* webpackChunkName: 'checkoutSuccess' */ 'src/components/Shop/CheckoutSuccess'
        ),
    );

const shopEnabled = JSON.parse(ENABLE_SHOP) === true;

const RootContainer = styled.div<{ isHome: boolean }>({
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
});

const FadingContainer = styled.div({
    height: '100%',
    width: '100%',
    visibility: 'hidden',
    transition: 'all 0.25s',
    overflow: 'hidden',
    position: 'absolute',
});

const getRouteBase = (pathname: string) => {
    const matches = pathname.match(/^(\/[^/]+)?(\/[^/]+)?/);
    return matches?.[1] || '/';
};

const getMostSpecificRouteName = (pathname: string) => {
    const matches = pathname.match(/^(\/[^/]+)?(\/[^/]+)?/);
    const match = matches?.[2] || matches?.[1];
    return match ? match.slice(1) : '';
};

const fadeOnEnter0 = fadeOnEnter(0);
const slideOnEnter0 = slideOnEnter(0);
const slideOnExit0 = slideOnExit(0);
const fadeOnEnter02 = fadeOnEnter(0.2);
const fadeOnExit05 = fadeOnExit(0.5);

type RouterMatchPaths =
    | PathMatch<'about'>
    | PathMatch<'*' | 'media'>
    | PathMatch<'*' | 'type'>
    | PathMatch<'shop' | '*'>
    | null;
type TransitionMatchPaths = PathMatch<'about'> | PathMatch<'*'> | null;

const useCustomMatch = (): [RouterMatchPaths, TransitionMatchPaths] => {
    const root = useMatch('/');
    const home = useMatch('home');
    const aboutRoot = useMatch('about');
    const about = useMatch('about/:about');
    const contact = useMatch('contact');
    const media = useMatch('media/:media/*');
    const mediaRoot = useMatch('media');
    const schedule = useMatch('schedule/:type/*');
    const scheduleRoot = useMatch('schedule');
    const shop = useMatch('shop/:shop/*');
    const shopRoot = useMatch('shop');
    const scheduleWithoutType = useMatch('schedule/*');
    const error = useMatch('not-found');

    const reducedForRouter = [
        root,
        home,
        about,
        contact,
        media,
        schedule,
        shop,
        aboutRoot,
        mediaRoot,
        scheduleRoot,
        shopRoot,
        error,
    ].reduce((prev, curr) => prev ?? curr, null);

    const reducedForTransition = [
        root,
        home,
        about,
        contact,
        media,
        scheduleWithoutType,
        shop,
        aboutRoot,
        mediaRoot,
        scheduleRoot,
        shopRoot,
        error,
    ].reduce((prev, curr) => prev ?? curr, null);

    return [reducedForRouter, reducedForTransition];
};

const StyledClickDiv = styled(ClickListenerOverlay)<{
    isMobile: boolean;
    cartOpen: boolean;
}>(
    {
        zIndex: 3001,
    },
    ({ cartOpen }) =>
        cartOpen && {
            backdropFilter: 'blur(2px)',
        },
    ({ isMobile, cartOpen }) =>
        isMobile && {
            zIndex: cartOpen ? 4998 : 5001,
            right: cartOpen ? 0 : 160,
            left: 0,
            width: 'unset',
        },
);

const App: React.FC<Record<never, unknown>> = () => {
    const location = useLocation();
    const { visible: cartVisible } = rootStore.cart.useTrackedStore();
    const { isVisible: navBarVisible, isExpanded: navBarExpanded, showSubs } = rootStore.navBar.useTrackedStore();

    const [delayedRouteBase, setDelayedRouteBase] = React.useState(
        getRouteBase(location.pathname),
    );

    const [delayedSpecific, setDelayedSpecific] = React.useState(
        getMostSpecificRouteName(location.pathname),
    );

    const arrowRef = React.useRef<HTMLDivElement | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

    const { matches: mediaMatches } = useMediaQueries(GLOBAL_QUERIES);
    const { isHamburger, screenXS, screenM, hiDpx } = mediaMatches;

    const navigate = useNavigate();

    // Make sure to adjust this match array when adding new pages, especially with subpaths
    const [routerMatch, transitionMatch] = useCustomMatch();

    const { data: shopItems, isSuccess } = useQuery({
        queryKey: ['shop'],
        queryFn: async () => {
            const { data: items } =
                await axios.get<ProductMap>('/api/shop/items');
            return items;
        },
    });

    React.useEffect(() => {
        if (isSuccess) {
            rootStore.shop.set.items?.(shopItems);
        }
    }, [shopItems, isSuccess]);

    const {
        x,
        y,
        refs: { reference, floating },
        strategy,
        middlewareData,
        update,
    } = useFloating<HTMLDivElement>({
        middleware: [
            offset({ mainAxis: hiDpx ? -12 : -4 }),
            shift(),
            arrow({ element: arrowRef }),
        ],
    });

    // Remove fbclid tracker
    React.useEffect(() => {
        const currentQuery = parse(location.search, {
            ignoreQueryPrefix: true,
        });
        if (currentQuery.fbclid) {
            navigate(
                location.pathname + stringify(omit(currentQuery, 'fbclid')),
            );
        }
    }, [navigate]);

    React.useEffect(() => {
        timerRef.current = setTimeout(() => {
            setDelayedRouteBase(getRouteBase(location.pathname));
            setDelayedSpecific(getMostSpecificRouteName(location.pathname));
        }, 700);
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [location]);

    React.useEffect(() => {
        if (!isHamburger) {
            if (!navBarVisible) {
                rootStore.navBar.set.toggleNavBar(true);
            }
        }
    }, [screenXS, screenM, navBarVisible]);

    const stableMediaArray = Object.entries(mediaMatches)
        .sort(([ka, _], [kb, __]) => ka.localeCompare(kb))
        .map(([_, v]) => v);

    React.useEffect(() => {
        mediaQueriesStore.set.matches(mediaMatches);
    }, [...stableMediaArray]);

    React.useEffect(() => {
        update();
    }, [...stableMediaArray, navBarExpanded, update]);

    let currentPage = getMostSpecificRouteName(location.pathname);
    currentPage = currentPage ? startCase(currentPage) : 'Home';
    const description =
        metaDescriptions[toLower(currentPage)] ||
        'Welcome to the official website of pianist, composer, and arranger Sean Chen';

    const isMobile = isHamburger;

    return (
        <HelmetProvider>
            <Global styles={globalCss} />
            <Helmet
                title={`${titleStringBase} ${currentPage}`}
                meta={[
                    {
                        name: 'description',
                        content: description as string,
                    },
                    {
                        name: 'copyright',
                        content: `copyright Sean Chen 2015-${format(
                            new Date(),
                            'yyyy',
                        )}.`,
                    },
                ]}
            />
            <RootContainer isHome={location.pathname === '/'}>
                <LogoSVG />
                <Transition<undefined>
                    in={navBarVisible || !isMobile}
                    onEntering={(el, isAppearing) => {
                        if (isAppearing) {
                            fadeOnEnter0(el, isAppearing);
                        } else {
                            slideOnEnter0(el);
                        }
                    }}
                    onExiting={slideOnExit0}
                    timeout={250}
                    appear={true}
                >
                    <NavBar
                        delayedRouteBase={delayedRouteBase}
                        currentBasePath={getRouteBase(location.pathname)}
                        specificRouteName={delayedSpecific}
                        ref={reference}
                    />
                </Transition>
                <SwitchTransition>
                    <Transition<undefined>
                        key={transitionMatch?.pathnameBase}
                        onEntering={fadeOnEnter02}
                        onExiting={fadeOnExit05}
                        timeout={800}
                        appear={true}
                    >
                        <FadingContainer>
                            <Routes
                                location={{
                                    ...location,
                                    pathname: routerMatch?.pathname,
                                    search: location.search,
                                }}
                            >
                                <Route path="about/*" element={<Container />}>
                                    <Route
                                        path="biography"
                                        element={
                                            <AsyncComponent<BioProps>
                                                moduleProvider={Bio}
                                            />
                                        }
                                    />
                                    <Route
                                        path="press"
                                        element={
                                            <AsyncComponent<PressProps>
                                                moduleProvider={Press}
                                            />
                                        }
                                    />
                                    <Route
                                        path="discography"
                                        element={
                                            <AsyncComponent<DiscsProps>
                                                moduleProvider={Discs}
                                            />
                                        }
                                    />
                                    <Route
                                        index
                                        element={
                                            <Navigate to="/about/biography" />
                                        }
                                    />
                                    <Route
                                        path="*"
                                        element={<Navigate to="/not-found" />}
                                    />
                                </Route>
                                <Route
                                    path="contact"
                                    element={
                                        <AsyncComponent<ContactProps>
                                            moduleProvider={Contact}
                                        />
                                    }
                                />
                                <Route path="media/*" element={<Container />}>
                                    <Route
                                        path="videos/*"
                                        element={
                                            <AsyncComponent<VideosProps>
                                                moduleProvider={Videos}
                                            />
                                        }
                                    />
                                    <Route
                                        path="music/*"
                                        element={
                                            <AsyncComponent<MusicProps>
                                                moduleProvider={Music}
                                            />
                                        }
                                    />
                                    <Route
                                        path="photos"
                                        element={
                                            <AsyncComponent<PhotosProps>
                                                moduleProvider={Photos}
                                            />
                                        }
                                    />
                                    <Route
                                        index
                                        element={
                                            <Navigate to="/media/videos" />
                                        }
                                    />
                                    <Route
                                        path="*"
                                        element={<Navigate to="/not-found" />}
                                    />
                                </Route>
                                <Route path="schedule/*">
                                    {eventListNamesArr.map((type) => (
                                        <Route
                                            key={`schedule-${type}`}
                                            path={type}
                                            element={
                                                <AsyncComponent<ScheduleProps>
                                                    moduleProvider={Schedule}
                                                    type={type}
                                                />
                                            }
                                        />
                                    ))}
                                    <Route
                                        index
                                        element={
                                            <Navigate to="/schedule/upcoming" />
                                        }
                                    />
                                    <Route
                                        path="*"
                                        element={<Navigate to="/not-found" />}
                                    />
                                </Route>

                                <Route path="shop/*" element={<Container />}>
                                    <Route
                                        path="scores/*"
                                        element={
                                            <AsyncComponent<ShopListProps>
                                                moduleProvider={ShopList}
                                            />
                                        }
                                    />
                                    <Route
                                        path="retrieve-purchased"
                                        element={
                                            <AsyncComponent<RetrievalFormProps>
                                                moduleProvider={RetrievalForm}
                                            />
                                        }
                                    />
                                    <Route
                                        path="faqs"
                                        element={
                                            <AsyncComponent<FAQsProps>
                                                moduleProvider={FAQs}
                                            />
                                        }
                                    />
                                    <Route
                                        path="checkout-success"
                                        element={
                                            <AsyncComponent<CheckoutSuccessProps>
                                                moduleProvider={CheckoutSuccess}
                                            />
                                        }
                                    />
                                    <Route
                                        index
                                        element={<Navigate to="/shop/scores" />}
                                    />
                                    <Route
                                        path="*"
                                        element={<Navigate to="/not-found" />}
                                    />
                                </Route>
                                <Route
                                    path="not-found"
                                    element={
                                        <AsyncComponent<object>
                                            moduleProvider={Page404}
                                        />
                                    }
                                />
                                <Route
                                    index
                                    element={
                                        <AsyncComponent<HomeProps>
                                            moduleProvider={Home}
                                        />
                                    }
                                />
                                <Route
                                    path="*"
                                    element={
                                        <AsyncComponent<object>
                                            moduleProvider={Page404}
                                        />
                                    }
                                />
                            </Routes>
                        </FadingContainer>
                    </Transition>
                </SwitchTransition>
                {shopEnabled && (
                    <Cart
                        floatingRef={
                            floating as React.MutableRefObject<HTMLDivElement>
                        }
                        arrowRef={arrowRef}
                        strategy={strategy}
                        position={{ x, y }}
                        arrow={middlewareData.arrow}
                        update={update}
                    />
                )}
                {(navBarExpanded || cartVisible) && (
                    <StyledClickDiv
                        isMobile={isMobile}
                        cartOpen={cartVisible}
                        onClick={() => {
                            cartVisible &&
                                rootStore.cart.set.toggleCartVisible(false);
                            navBarExpanded &&
                                rootStore.navBar.set.toggleExpanded(false);
                            showSubs.length &&
                                rootStore.navBar.set.callSub({
                                    sub: '',
                                    isHamburger: isMobile,
                                });
                        }}
                    />
                )}
            </RootContainer>
        </HelmetProvider>
    );
};

export default App;
