import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import { toMedia } from 'src/mediaQuery';
import { LoadingInstance } from 'src/components/LoadingSVG';
import {
    HEIGHT_ADJUST_DESKTOP,
    HEIGHT_ADJUST_MOBILE,
} from 'src/components/Media/Music/AudioVisualizerBase';
import {
    PauseButton,
    PauseIcon,
    PlayButton,
    PlayIcon,
    SkipButton,
} from 'src/components/Media/Music/Buttons';
import { cartesianToPolar } from 'src/components/Media/Music/utils';
import { isHamburger } from 'src/screens';
import { lightBlue } from 'src/styles/colors';
import { fadeOnEnter, fadeOnExit } from 'src/utils.js';
import { useAppDispatch, useAppSelector } from 'src/hooks.js';
import {
    hoverSeekringAction,
    isMouseMoveAction,
    updateAction,
} from './reducers.js';
import { mqSelectors } from 'src/components/App/reducers.js';
import { createSelector } from 'reselect';
import { GlobalStateShape } from 'src/store.js';

const isMouseEvent = <E extends Element>(
    event: AggregateUIEvent<E>,
): event is React.MouseEvent<E> => {
    return event.type.match(/(m|M)ouse/) !== null;
};

interface AudioUIOwnProps {
    readonly togglePlay: () => void;
    readonly onDrag: (percent: number) => void;
    readonly onStartDrag: (percent: number) => void;
    readonly playSubsequent: (which: 'prev' | 'next', fade?: boolean) => void;
    readonly seekAudio: (percent: number) => void;
}

type AudioUIProps = AudioUIOwnProps;

interface AudioUIState {
    isHoverPlaypause: boolean;
    isHoverNext: boolean;
    isHoverPrev: boolean;
    showUI: boolean;
}

const loadingInstanceStyle = css({
    position: 'relative',
    left: '50%',
    top: `calc(50% + ${HEIGHT_ADJUST_DESKTOP}px)`,
    transform: 'translateX(-50%) translateY(-50%)',
    fill: 'none',
    stroke: lightBlue,

    [toMedia(isHamburger)]: {
        top: `calc(50% + ${HEIGHT_ADJUST_MOBILE}px)`,
    },
});

const LoadingOverlay = styled.div({
    position: 'absolute',
    zIndex: 30,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0 0 0 / 0.5)',
});

const UIContainer = styled.div({
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
});

const ControlsContainer = styled.div({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
});

const StyledSeekRing = styled.canvas({
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    WebkitTapHighlightColor: 'transparent',
});

const flipped = css({
    transform: 'scaleX(-1)',
});

type AggregateUIEvent<E> =
    | React.MouseEvent<E>
    | React.TouchEvent<E>
    | TouchEvent;

const selector = createSelector(
    (state: GlobalStateShape) => state.musicPlayer,
    ({ isPlaying, isMouseMove, isLoading, radii: { inner, outer, base } }) => ({
        isPlaying,
        isMouseMove,
        isLoading,
        inner,
        outer,
        base,
    }),
);

const AudioUI: React.FC<AudioUIProps> = ({
    seekAudio,
    onStartDrag,
    playSubsequent,
    onDrag,
    togglePlay,
}) => {
    const [state, setState] = React.useState<AudioUIState>({
        isHoverPlaypause: false,
        isHoverNext: false,
        isHoverPrev: false,
        showUI: true,
    });

    const playIcon = React.useRef<HTMLDivElement>(null);
    const pauseIcon = React.useRef<HTMLDivElement>(null);
    const buttonRefs = React.useRef<{
        play: HTMLDivElement | null;
        pause: HTMLDivElement | null;
        prev: HTMLDivElement | null;
        next: HTMLDivElement | null;
    }>({
        play: null,
        pause: null,
        prev: null,
        next: null,
    });
    const dimensions = React.useRef<{
        height: number;
        width: number;
        centerX: number;
        centerY: number;
    }>({ height: 0, width: 0, centerX: 0, centerY: 0 });

    const timerId = React.useRef<ReturnType<typeof setTimeout>>();
    const prevPercentage = React.useRef<number>(0);
    const isDragging = React.useRef<boolean>();

    const seekRing = React.useRef<HTMLCanvasElement | null>(null);
    const visualizationCtx = React.useRef<CanvasRenderingContext2D | null>();

    const { isLoading, isMouseMove, isPlaying, inner, outer, base } =
        useAppSelector(selector);
    const isHamburger = useAppSelector(mqSelectors.isHamburger);

    const dispatch = useAppDispatch();

    const togglePlaying = <E extends Element>(
        event:
            | React.KeyboardEvent<E>
            | React.MouseEvent<E>
            | KeyboardEvent
            | MouseEvent,
    ): void => {
        if (
            (event as React.KeyboardEvent<E> | KeyboardEvent).key === ' ' ||
            (event as React.MouseEvent<E> | MouseEvent).button === 0
        ) {
            dispatch(updateAction({ playing: !isPlaying }));
            event.preventDefault();
        }
    };

    const onResize = React.useCallback(() => {
        if (seekRing.current) {
            dimensions.current = {
                ...dimensions.current,
                height: seekRing.current.offsetHeight,
                width: seekRing.current.offsetWidth,
                centerX: seekRing.current.offsetWidth / 2,
                centerY:
                    seekRing.current.offsetHeight / 2 +
                    (isHamburger
                        ? HEIGHT_ADJUST_MOBILE
                        : HEIGHT_ADJUST_DESKTOP),
            };
        }
    }, [isHamburger]);

    const initializeUI = (): void => {
        if (seekRing.current) {
            onResize();
            visualizationCtx.current = seekRing.current.getContext('2d');
            isDragging.current = false;
            dispatch(isMouseMoveAction(false));
            setState((prev) => ({ ...prev, isHoverPlaypause: false }));
        }
    };

    const getMousePositionInCanvas = React.useCallback(
        <E extends Element>(
            event: AggregateUIEvent<E>,
        ): { x: number; y: number } => {
            if (!seekRing.current) {
                return {
                    x: 0,
                    y: 0,
                };
            }
            const mouseX = isMouseEvent(event)
                ? event.clientX
                : event.touches[0].clientX;
            const mouseY = isMouseEvent(event)
                ? event.clientY
                : event.touches[0].clientY;
            const boundingRect = seekRing.current.getBoundingClientRect();
            return {
                x: mouseX - boundingRect.left,
                y: mouseY - boundingRect.top,
            };
        },
        [],
    );

    const isPointInCircle = React.useCallback(
        (
            point: [number, number],
            radius: number,
            center: [number, number],
        ): boolean => {
            const context = visualizationCtx.current;
            if (!context) {
                return false;
            }
            context.beginPath();
            context.arc(center[0], center[1], radius, 0, 2 * Math.PI);
            context.closePath();
            return context.isPointInPath(point[0], point[1]);
        },
        [],
    );

    const isEventInSeekRing = React.useCallback(
        <E extends Element>(event: AggregateUIEvent<E>): boolean => {
            const canvasPos = getMousePositionInCanvas(event);
            const isInOuter = isPointInCircle(
                [canvasPos.x, canvasPos.y],
                outer,
                [dimensions.current.centerX, dimensions.current.centerY],
            );
            const isInInner = isPointInCircle(
                [canvasPos.x, canvasPos.y],
                inner,
                [dimensions.current.centerX, dimensions.current.centerY],
            );
            return isInOuter && !isInInner;
        },
        [inner, outer],
    );

    const mousePositionToAngle = <E extends Element>(
        event: AggregateUIEvent<E>,
    ): number => {
        const mousePos = getMousePositionInCanvas(event);
        const polar = cartesianToPolar(
            mousePos.x - dimensions.current.centerX,
            mousePos.y - dimensions.current.centerY,
        );
        let angle = polar.angle + Math.PI / 2;
        if (angle < 0) {
            angle += Math.PI * 2;
        }
        return angle;
    };

    const mousePositionToPercentage = <E extends Element>(
        event: AggregateUIEvent<E>,
    ): number => {
        return mousePositionToAngle(event) / (2 * Math.PI);
    };

    const handleMousemove = React.useCallback(
        <E extends Element>(
            event: AggregateUIEvent<E>,
            passive = true,
        ): void => {
            const prevMoving = isMouseMove;
            if (!seekRing.current) {
                return;
            }
            if (isDragging.current) {
                prevPercentage.current = mousePositionToPercentage(event);
                onDrag(prevPercentage.current);
                seekRing.current.style.cursor = isMouseEvent(event)
                    ? 'pointer'
                    : 'default';
                dispatch(isMouseMoveAction(false));
                if (!passive) {
                    event.preventDefault();
                }
            } else {
                if (isEventInSeekRing(event) && !isHamburger) {
                    seekRing.current.style.cursor = 'pointer';
                    dispatch(
                        hoverSeekringAction({
                            isHoverSeekring: true,
                            angle: mousePositionToAngle(event),
                        }),
                    );
                    if (!prevMoving) {
                        dispatch(isMouseMoveAction(false));
                    } else {
                        if (timerId.current) {
                            clearTimeout(timerId.current);
                        }
                        timerId.current = setTimeout(
                            () => dispatch(isMouseMoveAction(false)),
                            3000,
                        );
                    }
                } else {
                    seekRing.current.style.cursor = 'default';
                    dispatch(
                        hoverSeekringAction({
                            isHoverSeekring: false,
                        }),
                    );
                    if (timerId.current) {
                        clearTimeout(timerId.current);
                    }
                    dispatch(isMouseMoveAction(true));
                    if (
                        Object.values(buttonRefs.current).includes(
                            event.currentTarget as HTMLDivElement,
                        )
                    ) {
                        event.stopPropagation();
                    } else {
                        timerId.current = setTimeout(
                            () => dispatch(isMouseMoveAction(false)),
                            3000,
                        );
                    }
                }
            }
        },
        [isHamburger, isMouseMove],
    );

    const handleActiveMousemove = <E extends Element>(
        event: AggregateUIEvent<E>,
    ): void => {
        handleMousemove(event, false);
    };

    const handleMouseup = React.useCallback(
        <E extends Element>(
            event: React.MouseEvent<E> | React.TouchEvent<E>,
        ): void => {
            const prevMoving = isMouseMove;
            if (isDragging.current) {
                seekAudio(prevPercentage.current);
                isDragging.current = false;
                if (!prevMoving) {
                    dispatch(isMouseMoveAction(false));
                } else {
                    if (timerId.current) {
                        clearTimeout(timerId.current);
                    }
                    timerId.current = setTimeout(
                        () => dispatch(isMouseMoveAction(false)),
                        3000,
                    );
                }
                if (
                    isMouseEvent(event) &&
                    !isEventInSeekRing(event) &&
                    seekRing.current
                ) {
                    seekRing.current.style.cursor = 'default';
                }
            }
        },
        [],
    );

    const handleMousedown = <E extends Element>(
        event: React.MouseEvent<E> | React.TouchEvent<E>,
    ): void => {
        if (isEventInSeekRing(event)) {
            isDragging.current = true;
            prevPercentage.current = mousePositionToPercentage(event);
            onStartDrag(prevPercentage.current);
        }
    };

    const handleMouseover = (state: keyof AudioUIState) => (): void => {
        setState(
            (prev) =>
                ({
                    ...prev,
                    [state]: true,
                }) as Pick<AudioUIState, keyof AudioUIState>,
        );
    };

    const handleMouseout = (state: keyof AudioUIState) => (): void => {
        setState(
            (prev) =>
                ({
                    ...prev,
                    [state]: false,
                }) as Pick<AudioUIState, keyof AudioUIState>,
        );
    };

    React.useEffect(() => {
        onResize();
    }, [isHamburger]);

    React.useEffect(() => {
        if (!isDragging) {
            if (isPlaying) {
                gsap.fromTo(
                    playIcon.current,
                    { opacity: 1, scale: 1, duration: 0.25 },
                    {
                        opacity: 0,
                        scale: 5,
                        delay: 0.1,
                        force3D: true,
                        clearProps: 'transform',
                    },
                );
            } else {
                gsap.fromTo(
                    pauseIcon.current,
                    { opacity: 1, scale: 1, duration: 0.25 },
                    {
                        opacity: 0,
                        scale: 5,
                        delay: 0.1,
                        force3D: true,
                        clearProps: 'transform',
                    },
                );
            }
        }
    }, [isPlaying, isDragging]);

    React.useEffect(() => {
        window.addEventListener('keydown', togglePlaying);
        window.addEventListener('resize', onResize);
        initializeUI();
        return () => {
            window.removeEventListener('keydown', togglePlaying);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    React.useLayoutEffect(() => {
        if (seekRing.current) {
            seekRing.current.addEventListener(
                'touchmove',
                handleActiveMousemove,
                { passive: false },
            );
            return () => {
                seekRing.current?.removeEventListener(
                    'touchmove',
                    handleActiveMousemove,
                );
            };
        }
    }, []);

    const buttonLength = base * Math.SQRT1_2;
    const verticalOffset = isHamburger
        ? HEIGHT_ADJUST_MOBILE
        : HEIGHT_ADJUST_DESKTOP;
    return (
        <UIContainer
            onMouseMove={handleMousemove}
            onMouseOver={handleMouseover('showUI')}
            onMouseOut={handleMouseout('showUI')}
            onMouseUp={handleMouseup}
        >
            {(isLoading && false) && (
                <LoadingOverlay>
                    <LoadingInstance
                        width={200}
                        height={200}
                        css={loadingInstanceStyle}
                    />
                </LoadingOverlay>
            )}
            <Transition
                in={isMouseMove || isHamburger}
                onEnter={fadeOnEnter()}
                onExit={fadeOnExit()}
                timeout={250}
                mountOnEnter={true}
                unmountOnExit={true}
            >
                <ControlsContainer>
                    <PauseIcon
                        ref={pauseIcon}
                        width={buttonLength}
                        height={buttonLength}
                        verticalOffset={verticalOffset}
                    />
                    <PlayIcon
                        ref={playIcon}
                        width={buttonLength}
                        height={buttonLength}
                        verticalOffset={verticalOffset}
                    />
                    <SkipButton
                        ref={(el) => (buttonRefs.current.prev = el)}
                        key="prev-button"
                        onClick={() => playSubsequent('prev')}
                        isHovering={state.isHoverPrev}
                        onMouseMove={handleMousemove}
                        onMouseOver={handleMouseover('isHoverPrev')}
                        onMouseOut={handleMouseout('isHoverPrev')}
                        onBlur={handleMouseout('isHoverPrev')}
                        onFocus={handleMouseover('isHoverPrev')}
                        onMouseUp={handleMouseup}
                        width={(buttonLength * 4) / 5}
                        height={(buttonLength * 8) / 15}
                        verticalOffset={verticalOffset}
                        css={flipped}
                    />
                    {isPlaying ? (
                        <PauseButton
                            ref={(el) => (buttonRefs.current.pause = el)}
                            key="pause-button"
                            onClick={togglePlay}
                            isHovering={state.isHoverPlaypause}
                            onMouseMove={handleMousemove}
                            onMouseOver={handleMouseover('isHoverPlaypause')}
                            onMouseOut={handleMouseout('isHoverPlaypause')}
                            onBlur={handleMouseout('isHoverPlaypause')}
                            onFocus={handleMouseover('isHoverPlaypause')}
                            onMouseUp={handleMouseup}
                            width={buttonLength}
                            height={buttonLength}
                            verticalOffset={verticalOffset}
                        />
                    ) : (
                        <PlayButton
                            ref={(el) => (buttonRefs.current.play = el)}
                            key="play-button"
                            onClick={togglePlay}
                            isHovering={state.isHoverPlaypause}
                            onMouseMove={handleMousemove}
                            onMouseOver={handleMouseover('isHoverPlaypause')}
                            onMouseOut={handleMouseout('isHoverPlaypause')}
                            onBlur={handleMouseout('isHoverPlaypause')}
                            onFocus={handleMouseover('isHoverPlaypause')}
                            onMouseUp={handleMouseup}
                            width={buttonLength}
                            height={buttonLength}
                            verticalOffset={verticalOffset}
                        />
                    )}
                    <SkipButton
                        ref={(el) => (buttonRefs.current.next = el)}
                        key="next-button"
                        onClick={() => playSubsequent('next')}
                        isHovering={state.isHoverNext}
                        onMouseMove={handleMousemove}
                        onMouseOver={handleMouseover('isHoverNext')}
                        onMouseOut={handleMouseout('isHoverNext')}
                        onBlur={handleMouseout('isHoverNext')}
                        onFocus={handleMouseover('isHoverNext')}
                        onMouseUp={handleMouseup}
                        width={(buttonLength * 4) / 5}
                        height={(buttonLength * 8) / 15}
                        verticalOffset={verticalOffset}
                    />
                </ControlsContainer>
            </Transition>
            <StyledSeekRing
                ref={seekRing}
                onMouseMove={handleMousemove}
                onMouseUp={handleMouseup}
                onMouseDown={handleMousedown}
                onTouchStart={handleMousedown}
                onTouchMove={handleMousemove}
                onTouchEnd={handleMouseup}
            />
        </UIContainer>
    );
};

export default AudioUI;
