import { omit, startCase, toLower } from 'lodash-es';
import { parse, stringify } from 'qs';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import ReactMedia from 'react-media';
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { Transition, TransitionGroup } from 'react-transition-group';

import Container from 'src/components/App/Container';

// import { RequiredProps as AboutProps } from 'src/components/About/About';
import { RequiredProps as ContactProps } from 'src/components/Contact/Contact';
import { RequiredProps as HomeProps } from 'src/components/Home/Home';
// import { RequiredProps as MediaProps } from 'src/components/Media/Media';
import { RequiredProps as ScheduleProps } from 'src/components/Schedule/Schedule';
import { RequiredProps as ShopListProps } from 'src/components/Shop/ShopList/ShopList';
import { RequiredProps as RetrievalFormProps } from 'src/components/Shop/RetrievePurchases/RetrievePurchases';
import { RequiredProps as FAQsProps } from 'src/components/Shop/FAQs/FAQs';
// import { RequiredProps as AuthorizationProps } from 'src/components/Authorization/Authorization';
import { RequiredProps as BioProps } from 'src/components/About/Bio/Bio';
import { RequiredProps as DiscsProps } from 'src/components/About/Discs/Discs';
import { RequiredProps as PressProps } from 'src/components/About/Press/Press';
import { RequiredProps as MusicProps } from 'src/components/Media/Music/Music';
import { RequiredProps as PhotosProps } from 'src/components/Media/Photos/Photos';
import { RequiredProps as VideosProps } from 'src/components/Media/Videos/Videos';
import { RequiredProps as CheckoutSuccessProps } from 'src/components/Shop/CheckoutSuccess/CheckoutSuccess';

import { Global } from '@emotion/react';
import styled from '@emotion/styled';
import { globalCss } from 'src/styles/global';

import Cart from 'src/components/Cart/Cart';
import { toggleCartList } from 'src/components/Cart/reducers';
import { ClickListenerOverlay } from 'src/components/ClickListenerOverlay';
import { toggleNavBar } from 'src/components/App/NavBar/reducers';
import NavBar from 'src/components/App/NavBar/NavBar';
import { LogoSVG } from 'src/components/LogoSVG';

import AsyncComponent from 'src/components/AsyncComponent';
import extractModule from 'src/module';
import store from 'src/store';
import { reactMediaMobileQuery } from 'src/styles/screens';
import { metaDescriptions, titleStringBase, slideOnExit, fadeOnEnter, fadeOnExit, slideOnEnter } from 'src/utils';
import { useFloating, offset, arrow, shift, autoUpdate } from '@floating-ui/react-dom';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import format from 'date-fns/format';
import { fetchShopItems } from 'src/components/Shop/ShopList/reducers';

const register = extractModule(store);
// const About = () => register('about', import(/* webpackChunkName: 'about' */ 'src/components/About'));
const Contact = () => register('contact', import(/* webpackChunkName: 'contact' */ 'src/components/Contact'));
const Home = () => register('home', import(/* webpackChunkName: 'home' */ 'src/components/Home'));
// const Media = () => register('media', import(/* webpackChunkName: 'media' */ 'src/components/Media'));
const Schedule = () => register('schedule', import(/* webpackChunkName: 'schedule' */ 'src/components/Schedule'));
const Page404 = () => register('page404', import(/* webpackChunkName: 'page404' */ 'src/components/Error'));
// const Authorization = () => register('authorization', import(/* webpackChunkName: 'authorization' */ 'src/components/Authorization'));

const Bio = () => register('bio', import(/* webpackChunkName: 'bio' */ 'src/components/About/Bio'));
const Press = () => register('press', import(/* webpackChunkName: 'press' */ 'src/components/About/Press'));
const Discs = () => register('discs', import(/* webpackChunkName: 'discs' */ 'src/components/About/Discs'));

const Music = () => register('music', import(/* webpackChunkName: 'music' */ 'src/components/Media/Music'));
const Photos = () => register('photos', import(/* webpackChunkName: 'photos' */ 'src/components/Media/Photos'));
const Videos = () => register('videos', import(/* webpackChunkName: 'videos' */ 'src/components/Media/Videos'));

const ShopList = () => register('shop', import(/* webpackChunkName: 'shop' */ 'src/components/Shop/ShopList'));
const RetrievalForm = () => register('retrievalForm', import(/* webpackChunkName: 'retrievalForm' */ 'src/components/Shop/RetrievePurchases'))
const FAQs = () => register('faqs', import(/* webpackChunkName: 'faqs' */ 'src/components/Shop/FAQs'));
const CheckoutSuccess = () => register('checkoutSuccess', import(/* webpackChunkName: 'checkoutSuccess' */'src/components/Shop/CheckoutSuccess'));
// import { FAQs } from 'src/components/Shop/FAQs/FAQs';
// import { RetrievalForm } from 'src/components/Shop/RetrievePurchases/RetrievePurchases';

const RootContainer = styled.div<{ isHome: boolean }>`
    height: 100%;
    width: 100%;
    background-color: white;
`;

const FadingContainer = styled.div<{ shouldBlur: boolean }>({
    height: '100%',
    width: '100%',
    visibility: 'hidden',
    transition: 'all 0.25s',
    overflow: 'hidden',
    position: 'absolute',
}, ({ shouldBlur }) => shouldBlur && ({
    filter: 'blur(8px)',
}));

const getRouteBase = (pathname: string) => {
    const matches = pathname.match(/^(\/[^/]+)?(\/[^/]+)?/);
    return matches?.[1] || '/';
}

const getMostSpecificRouteName = (pathname: string) => {
    const matches = pathname.match(/^(\/[^/]+)?(\/[^/]+)?/);
    const match = matches?.[2] || matches?.[1];
    return (match ? match.slice(1) : '') || undefined;
}

const App: React.FC<Record<string, unknown>> = ({ }) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const navbarVisible = useAppSelector(({ navbar }) => navbar.isVisible);
    const menuOpen = useAppSelector(({ navbar }) => navbar.isExpanded);
    const cartOpen = useAppSelector(({ cart }) => cart.visible);
    const [delayedRouteBase, setDelayedRouteBase] = React.useState(getRouteBase(location.pathname));
    const arrowRef = React.useRef<HTMLDivElement | null>(null);
    const timerRef = React.useRef<NodeJS.Timeout>();
    const navigate = useNavigate();
    // Make sure to adjust this match array when adding new pages, especially with subpaths
    const match = [
        useMatch('/'),
        useMatch('home'),
        useMatch('about/:about'),
        useMatch('contact'),
        useMatch('media/:media/*'),
        useMatch('schedule/:type/*'),
        useMatch('shop/:shop/*'),
        useMatch('auth/*')
    ].reduce((prev, curr) => prev ?? curr, null);

    const { x, y, reference, floating, strategy, middlewareData, update, refs } = useFloating({
        middleware: [
            offset(6),
            shift(),
            arrow({ element: arrowRef }),
        ]
    });

    // Remove fbclid tracker
    React.useEffect(() => {
        const currentQuery = parse(location.search, { ignoreQueryPrefix: true });
        if (currentQuery.fbclid) {
            navigate(location.pathname + stringify(omit(currentQuery, 'fbclid')));
        }
    }, [navigate]);

    React.useEffect(() => {
        timerRef.current = setTimeout(() => { setDelayedRouteBase(getRouteBase(location.pathname)); }, 250);
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [location]);

    React.useEffect(() => {
        if (!refs.reference.current || !refs.floating.current) {
            return;
        }

        // Only call this when the floating element is rendered
        return autoUpdate(
            refs.reference.current,
            refs.floating.current,
            update
        );
    }, [refs.reference, refs.floating, update]);

    React.useEffect(() => {
        dispatch(fetchShopItems());
    }, []);

    let currentPage = getMostSpecificRouteName(location.pathname);
    currentPage = currentPage ? startCase(currentPage) : 'Home';
    const description =
        metaDescriptions[toLower(currentPage)] || 'Welcome to the official website of pianist, composer, and arranger Sean Chen';
    return (
        <>
            <Global styles={globalCss} />
            <Helmet
                title={`${titleStringBase} | ${currentPage}`}
                meta={[
                    {
                        name: 'description',
                        content: description,
                    },
                    {
                        name: 'copyright',
                        content: `copyright Sean Chen 2015-${format(new Date(), 'yyyy')}.`,
                    },
                ]}
            />
            <ReactMedia query={reactMediaMobileQuery}>
                {(matches: boolean) => {
                    if (!matches) {
                        if (!navbarVisible) {
                            dispatch(toggleNavBar(true));
                        }
                    }
                    return (
                        <RootContainer isHome={match?.pathnameBase === '/'}>
                            <LogoSVG />
                            <Transition<undefined>
                                in={navbarVisible || !matches}
                                onEntering={match?.pathnameBase === '/' ? fadeOnEnter(0) : slideOnEnter(0)}
                                onExiting={slideOnExit(0)}
                                timeout={250}
                                appear={true}
                            >
                                <NavBar
                                    delayedRouteBase={delayedRouteBase}
                                    currentBasePath={getRouteBase(location.pathname)}
                                    specificRouteName={getMostSpecificRouteName(location.pathname)}
                                    ref={reference}
                                />
                            </Transition>
                            <TransitionGroup component={null}>
                                <Transition<undefined>
                                    key={match?.pathnameBase + location.search}
                                    onEntering={fadeOnEnter(0.25)}
                                    onExiting={fadeOnExit(0)}
                                    timeout={750}
                                    appear={true}
                                >
                                    <FadingContainer shouldBlur={matches && (cartOpen || menuOpen) && delayedRouteBase !== '/'}>
                                        <Routes location={match?.pathnameBase + location.search}>
                                            <Route path="about/*" element={<Container />}>
                                                <Route path="biography" element={
                                                    <AsyncComponent<BioProps> moduleProvider={Bio} isMobile={matches} />
                                                } />
                                                <Route path="press" element={
                                                    <AsyncComponent<PressProps> moduleProvider={Press} isMobile={matches} />
                                                } />
                                                <Route path="discography" element={
                                                    <AsyncComponent<DiscsProps> moduleProvider={Discs} isMobile={matches} />
                                                } />
                                                <Route index element={
                                                    <Navigate replace to="biography" />
                                                } />
                                            </Route>
                                            <Route path="contact" element={
                                                <AsyncComponent<ContactProps> moduleProvider={Contact} isMobile={matches} />
                                            } />
                                            <Route path="media/*" element={<Container />}>
                                                <Route path="videos/*" element={
                                                    <AsyncComponent<VideosProps> moduleProvider={Videos} isMobile={matches} />
                                                } />
                                                <Route path="music/*" element={
                                                    <AsyncComponent<MusicProps> moduleProvider={Music} isMobile={matches} />
                                                } />
                                                <Route path="photos" element={
                                                    <AsyncComponent<PhotosProps> moduleProvider={Photos} isMobile={matches} />
                                                } />
                                                <Route index element={
                                                    <Navigate replace to="videos" />
                                                } />
                                            </Route>
                                            <Route path="schedule/*" >
                                                <Route path="upcoming/*" element={
                                                    <AsyncComponent<ScheduleProps> moduleProvider={Schedule} isMobile={matches} type="upcoming" />
                                                } />
                                                <Route path="archive/*" element={
                                                    <AsyncComponent<ScheduleProps> moduleProvider={Schedule} isMobile={matches} type="archive" />
                                                } />
                                                <Route path="search/*" element={
                                                    <AsyncComponent<ScheduleProps> moduleProvider={Schedule} isMobile={matches} type="search" />
                                                } />
                                                <Route index element={
                                                    <Navigate replace to={'upcoming'} />
                                                } />
                                            </Route>
                                            <Route path="shop/*" element={
                                                <Container />
                                            }>
                                                <Route path="scores/*" element={
                                                    <AsyncComponent<ShopListProps> moduleProvider={ShopList} isMobile={matches} />
                                                } />
                                                <Route path="retrieve-purchased" element={
                                                    <AsyncComponent<RetrievalFormProps> moduleProvider={RetrievalForm} isMobile={matches} />
                                                } />
                                                <Route path="faqs" element={
                                                    <AsyncComponent<FAQsProps> moduleProvider={FAQs} isMobile={matches} />
                                                } />
                                                <Route path="checkout-success" element={
                                                    <AsyncComponent<CheckoutSuccessProps> moduleProvider={CheckoutSuccess} isMobile={matches} />
                                                } />
                                                <Route index element={
                                                    <Navigate replace to={'scores'} />
                                                } />
                                            </Route>
                                            {/* <Route path="auth/*" element={
                                                <AsyncComponent<AuthorizationProps> moduleProvider={Authorization} isMobile={matches} />
                                            } /> */}
                                            <Route index element={
                                                <AsyncComponent<HomeProps> moduleProvider={Home} isMobile={matches} />
                                            } />
                                            <Route path="*" element={
                                                <AsyncComponent<unknown> moduleProvider={Page404} />
                                            } />
                                        </Routes>
                                    </FadingContainer>
                                </Transition>
                            </TransitionGroup>
                            <Cart
                                floatingRef={floating}
                                arrowRef={arrowRef}
                                isMobile={matches}
                                strategy={strategy}
                                position={{ x, y }}
                                arrow={middlewareData.arrow}
                                update={update}
                            />
                            {(matches && cartOpen) &&
                                <ClickListenerOverlay onClick={() => dispatch(toggleCartList(false))} />}
                            {(matches && menuOpen) &&
                                <ClickListenerOverlay onClick={() => { }} /> /* eslint-disable-line @typescript-eslint/no-empty-function */
                            }
                        </RootContainer>
                    );
                }}
            </ReactMedia>
        </>
    );
};

export default App