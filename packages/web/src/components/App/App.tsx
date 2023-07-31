import { Global } from '@emotion/react';
import styled from '@emotion/styled';
import { arrow, offset, shift, useFloating } from '@floating-ui/react-dom';
import format from 'date-fns/format';
import { omit, startCase, toLower } from 'lodash-es';
import { parse, stringify } from 'qs';
import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useMedia } from 'react-media';
import {
    Navigate,
    PathMatch,
    Route,
    Routes,
    useLocation,
    useMatch,
    useNavigate,
} from 'react-router-dom';
import { SwitchTransition, Transition } from 'react-transition-group';

import Container from 'src/components/App/Container';

// import { RequiredProps as AboutProps } from 'src/components/About/About';
import { RequiredProps as ContactProps } from 'src/components/Contact/Contact';
import { RequiredProps as HomeProps } from 'src/components/Home/Home';
// import { RequiredProps as MediaProps } from 'src/components/Media/Media';
import { RequiredProps as ScheduleProps } from 'src/components/Schedule/Schedule';
import { RequiredProps as FAQsProps } from 'src/components/Shop/FAQs/FAQs';
import { RequiredProps as RetrievalFormProps } from 'src/components/Shop/RetrievePurchases/RetrievePurchases';
import { RequiredProps as ShopListProps } from 'src/components/Shop/ShopList/ShopList';
// import { RequiredProps as AuthorizationProps } from 'src/components/Authorization/Authorization';
import { RequiredProps as BioProps } from 'src/components/About/Bio/Bio';
import { RequiredProps as DiscsProps } from 'src/components/About/Discs/Discs';
import { RequiredProps as PressProps } from 'src/components/About/Press/Press';
import { RequiredProps as MusicProps } from 'src/components/Media/Music/Music';
import { RequiredProps as PhotosProps } from 'src/components/Media/Photos/Photos';
import { RequiredProps as VideosProps } from 'src/components/Media/Videos/Videos';
import { RequiredProps as CheckoutSuccessProps } from 'src/components/Shop/CheckoutSuccess/CheckoutSuccess';

import NavBar from 'src/components/App/NavBar/NavBar';
import {
    showSubNav,
    toggleExpanded,
    toggleNavBar,
} from 'src/components/App/NavBar/reducers';
import AsyncComponent from 'src/components/AsyncComponent';
import Cart from 'src/components/Cart/Cart';
import { toggleCartList } from 'src/components/Cart/reducers';
import { ClickListenerOverlay } from 'src/components/ClickListenerOverlay';
import { LogoSVG } from 'src/components/LogoSVG';
import {
    EventListName,
    eventListNamesArr,
} from 'src/components/Schedule/types';
import { fetchShopItems } from 'src/components/Shop/ShopList/reducers';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import extractModule from 'src/module';
import { GLOBAL_QUERIES } from 'src/screens';
import store from 'src/store';
import { globalCss } from 'src/styles/global';
import {
    fadeOnEnter,
    fadeOnExit,
    metaDescriptions,
    slideOnEnter,
    slideOnExit,
    titleStringBase,
} from 'src/utils';
import { setMatches } from './reducers';

const register = extractModule(store);
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

const RootContainer = styled.div<{ isHome: boolean }>({
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
});

const FadingContainer = styled.div<{ shouldBlur: boolean }>(
    {
        height: '100%',
        width: '100%',
        visibility: 'hidden',
        transition: 'all 0.25s',
        overflow: 'hidden',
        position: 'absolute',
    },
    ({ shouldBlur }) =>
        shouldBlur &&
        {
            // filter: 'blur(8px)',
        },
);

const getRouteBase = (pathname: string) => {
    const matches = pathname.match(/^(\/[^/]+)?(\/[^/]+)?/);
    return matches?.[1] || '/';
};

const getMostSpecificRouteName = (pathname: string) => {
    const matches = pathname.match(/^(\/[^/]+)?(\/[^/]+)?/);
    const match = matches?.[2] || matches?.[1];
    return match ? match.slice(1) : '';
};

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

    console.log(reducedForRouter);

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
    const dispatch = useAppDispatch();
    const navbarVisible = useAppSelector(({ navbar }) => navbar.isVisible);
    const menuOpen = useAppSelector(({ navbar }) => navbar.isExpanded);
    const cartOpen = useAppSelector(({ cart }) => cart.visible);
    const showSubs = useAppSelector(({ navbar }) => navbar.showSubs);
    const [delayedRouteBase, setDelayedRouteBase] = React.useState(
        getRouteBase(location.pathname),
    );
    const [delayedSpecific, setDelayedSpecific] = React.useState(
        getMostSpecificRouteName(location.pathname),
    );
    const arrowRef = React.useRef<HTMLDivElement | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setTimeout>>();
    const mediaMatches = useMedia({ queries: GLOBAL_QUERIES });
    const { isHamburger, screenXS, screenM } = mediaMatches;
    const navigate = useNavigate();
    // Make sure to adjust this match array when adding new pages, especially with subpaths
    const [routerMatch, transitionMatch] = useCustomMatch();

    const {
        x,
        y,
        refs: { reference, floating },
        strategy,
        middlewareData,
        update,
    } = useFloating<HTMLDivElement>({
        middleware: [offset(-12), shift(), arrow({ element: arrowRef })],
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
        dispatch(fetchShopItems());
    }, []);

    React.useEffect(() => {
        if (!isHamburger) {
            if (!navbarVisible) {
                dispatch(toggleNavBar(true));
            }
        }
    }, [screenXS, screenM, navbarVisible, dispatch]);

    React.useEffect(() => {
        dispatch(setMatches(mediaMatches));
    }, [mediaMatches]);

    React.useEffect(() => {
        update();
    }, [mediaMatches, menuOpen]);

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
                        content: description,
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
                    in={navbarVisible || !isMobile}
                    onEntering={(el, isAppearing) => {
                        if (isAppearing) {
                            fadeOnEnter(0)(el, isAppearing);
                        } else {
                            slideOnEnter(0)(el);
                        }
                    }}
                    onExiting={slideOnExit(0)}
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
                        onEntering={fadeOnEnter(0.2)}
                        onExiting={fadeOnExit(0.5)}
                        timeout={800}
                        appear={true}
                    >
                        <FadingContainer
                            shouldBlur={
                                isMobile &&
                                (cartOpen || menuOpen) &&
                                delayedRouteBase !== '/'
                            }
                        >
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
                {(menuOpen || cartOpen) && (
                    <StyledClickDiv
                        isMobile={isMobile}
                        cartOpen={cartOpen}
                        onClick={() => {
                            cartOpen && dispatch(toggleCartList(false));
                            menuOpen && dispatch(toggleExpanded(false));
                            showSubs.length &&
                                dispatch(
                                    showSubNav({
                                        sub: '',
                                        isHamburger: isMobile,
                                    }),
                                );
                        }}
                    />
                )}
            </RootContainer>
        </HelmetProvider>
    );
};

export default App;
