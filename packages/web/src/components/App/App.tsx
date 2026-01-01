import { Global } from '@emotion/react';
import styled from '@emotion/styled';
import { arrow, offset, shift, useFloating } from '@floating-ui/react-dom';
import { useMediaQueries } from '@react-hook/media-query';
import { format } from 'date-fns';
import { useAtom, useSetAtom } from 'jotai';
import { omit, startCase, toLower } from 'lodash-es';
import { parse, stringify } from 'qs';
import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
    Navigate,
    type PathMatch,
    Route,
    Routes,
    useLocation,
    useMatch,
    useNavigate,
} from 'react-router-dom';
import { SwitchTransition, Transition } from 'react-transition-group';
import Container from 'src/components/App/Container';
import NavBar from 'src/components/App/NavBar/NavBar';
import Cart from 'src/components/Cart/Cart';
import { ClickListenerOverlay } from 'src/components/ClickListenerOverlay';
import { LogoSVG } from 'src/components/LogoSVG';
import { eventListNamesArr } from 'src/components/Schedule/types';
import { GLOBAL_QUERIES } from 'src/screens';
import { globalCss } from 'src/styles/global';
import {
    fadeOnEnter,
    fadeOnExit,
    metaDescriptions,
    slideOnEnter,
    slideOnExit,
    titleStringBase,
} from 'src/utils';
import { cartAtoms } from '../Cart/store.js';
import { navBarAtoms } from './NavBar/store.js';
import { mediaQueriesMatch } from './store.js';

const Contact = React.lazy(() => import('src/components/Contact'));
const Home = React.lazy(() => import('src/components/Home'));
const Schedule = React.lazy(() => import('src/components/Schedule'));
const Page404 = React.lazy(() => import('src/components/Error'));

const Bio = React.lazy(() => import('src/components/About/Bio'));
const Press = React.lazy(() => import('src/components/About/Press'));
const Discs = React.lazy(() => import('src/components/About/Discs'));

const Music = React.lazy(() => import('src/components/Media/Music'));
const Photos = React.lazy(() => import('src/components/Media/Photos'));
const Videos = React.lazy(() => import('src/components/Media/Videos'));

const ShopList = React.lazy(() => import('src/components/Shop/ShopList'));
const RetrievalForm = React.lazy(
    () => import('src/components/Shop/RetrievePurchases'),
);
const FAQs = React.lazy(() => import('src/components/Shop/FAQs'));
const CheckoutSuccess = React.lazy(
    () => import('src/components/Shop/CheckoutSuccess'),
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

const fadeOnEnter0 = (ref: React.RefObject<HTMLDivElement | null>) =>
    fadeOnEnter(ref, 0);
const slideOnEnter0 = (ref: React.RefObject<HTMLDivElement | null>) =>
    slideOnEnter(ref, 0);
const slideOnExit0 = (ref: React.RefObject<HTMLDivElement | null>) =>
    slideOnExit(ref, 0);
const fadeOnEnter02 = (ref: React.RefObject<HTMLDivElement | null>) =>
    fadeOnEnter(ref, 0.2);
const fadeOnExit05 = (ref: React.RefObject<HTMLDivElement | null>) =>
    fadeOnExit(ref, 0.5);

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
    const [cartVisible, toggleCartVisible] = useAtom(cartAtoms.visible);
    const [navBarVisible, toggleNavBar] = useAtom(navBarAtoms.isVisible);
    const [navBarExpanded, toggleNavBarExpanded] = useAtom(
        navBarAtoms.isExpanded,
    );
    const [showSubs, setShowSubs] = useAtom(navBarAtoms.showSubs);
    const setMediaQueries = useSetAtom(mediaQueriesMatch);
    // const { isVisible: navBarVisible, isExpanded: navBarExpanded, showSubs } = rootStore.navBar.useTrackedStore();

    const [delayedRouteBase, setDelayedRouteBase] = React.useState(
        getRouteBase(location.pathname),
    );

    const [delayedSpecific, setDelayedSpecific] = React.useState(
        getMostSpecificRouteName(location.pathname),
    );

    const arrowRef = React.useRef<HTMLDivElement>(null);
    const timerRef = React.useRef<ReturnType<typeof setTimeout>>(0);
    const navbarRef = React.useRef<HTMLDivElement>(null);
    const fadingRef = React.useRef<HTMLDivElement>(null);

    const { matches: mediaMatches } = useMediaQueries(GLOBAL_QUERIES);
    const { isHamburger, screenXS, screenM, hiDpx } = mediaMatches;

    const navigate = useNavigate();

    // Make sure to adjust this match array when adding new pages, especially with subpaths
    const [routerMatch, transitionMatch] = useCustomMatch();

    // const { data: shopItems, isSuccess } = useQuery({
    //     queryKey: ['shop'],
    //     queryFn: async () => {
    //         const { data: items } =
    //             await axios.get<ProductMap>('/api/shop/items');
    //         return items;
    //     },
    // });

    // React.useEffect(() => {
    //     if (isSuccess) {
    //         rootStore.shop.set.items?.(shopItems);
    //     }
    // }, [shopItems, isSuccess]);

    const {
        x,
        y,
        refs: { reference: anchorRef, floating },
        strategy,
        middlewareData,
        update,
    } = useFloating<HTMLButtonElement>({
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
        if (!isHamburger && !navBarVisible) {
            toggleNavBar(true);
        }
    }, [screenXS, screenM, navBarVisible]);

    const stableMediaArray = Object.entries(mediaMatches)
        .sort(([ka, _], [kb, __]) => ka.localeCompare(kb))
        .map(([_, v]) => v);

    React.useEffect(() => {
        setMediaQueries(mediaMatches);
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
                <Transition
                    in={navBarVisible || !isMobile}
                    onEntering={(isAppearing) => {
                        if (isAppearing) {
                            fadeOnEnter0(navbarRef)(isAppearing);
                        } else {
                            slideOnEnter0(navbarRef)();
                        }
                    }}
                    onExiting={slideOnExit0(navbarRef)}
                    timeout={250}
                    appear={true}
                    nodeRef={navbarRef}
                >
                    <NavBar
                        delayedRouteBase={delayedRouteBase}
                        currentBasePath={getRouteBase(location.pathname)}
                        specificRouteName={delayedSpecific}
                        anchorRef={anchorRef}
                        navbarRef={navbarRef}
                    />
                </Transition>
                <SwitchTransition>
                    <Transition
                        key={transitionMatch?.pathnameBase}
                        onEntering={fadeOnEnter02(fadingRef)}
                        onExiting={fadeOnExit05(fadingRef)}
                        timeout={800}
                        appear={true}
                        nodeRef={fadingRef}
                        mountOnEnter={true}
                        unmountOnExit={true}
                    >
                        <FadingContainer ref={fadingRef}>
                            <Routes
                                location={{
                                    ...location,
                                    pathname: routerMatch?.pathname,
                                    search: location.search,
                                }}
                            >
                                <Route path="about/*" element={<Container />}>
                                    <Route path="biography" element={<Bio />} />
                                    <Route path="press" element={<Press />} />
                                    <Route
                                        path="discography"
                                        element={<Discs />}
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
                                <Route path="contact" element={<Contact />} />
                                <Route path="media/*" element={<Container />}>
                                    <Route
                                        path="videos/*"
                                        element={<Videos />}
                                    />
                                    <Route path="music/*" element={<Music />} />
                                    <Route path="photos" element={<Photos />} />
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
                                            path={`${type}/*`}
                                            element={<Schedule type={type} />}
                                        />
                                    ))}
                                    <Route
                                        key="schedule-event"
                                        path="event/*"
                                        element={<Schedule type="event" />}
                                    />
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
                                        path="scores/:product?"
                                        element={<ShopList />}
                                    />
                                    <Route
                                        path="retrieve-purchased"
                                        element={<RetrievalForm />}
                                    />
                                    <Route path="faqs" element={<FAQs />} />
                                    <Route
                                        path="checkout-success"
                                        element={<CheckoutSuccess />}
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
                                    element={<Page404 />}
                                />
                                <Route
                                    index
                                    element={<Home />}
                                />
                                <Route
                                    path="*"
                                    element={<Page404 />}
                                />
                            </Routes>
                        </FadingContainer>
                    </Transition>
                </SwitchTransition>
                {shopEnabled && (
                    <Cart
                        floatingRef={
                            floating as React.RefObject<HTMLDivElement>
                        }
                        arrowRef={arrowRef}
                        strategy={strategy}
                        position={{ x, y }}
                        arrow={middlewareData.arrow}
                        update={update}
                    />
                )}
                {(navBarExpanded || cartVisible || showSubs.length) && (
                    <StyledClickDiv
                        isMobile={isMobile}
                        cartOpen={cartVisible}
                        onClick={() => {
                            cartVisible && toggleCartVisible(false);
                            navBarExpanded && toggleNavBarExpanded(false);
                            showSubs.length &&
                                setShowSubs({
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
