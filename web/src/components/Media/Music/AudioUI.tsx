import * as React from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { gsap } from 'gsap';
import { LoadingInstance } from 'src/components/LoadingSVG';
import { PauseButton, PauseIcon, PlayButton, PlayIcon, SkipButton } from 'src/components/Media/Music/Buttons';
import { cartesianToPolar } from 'src/components/Media/Music/utils';

import { HEIGHT_ADJUST_DESKTOP, HEIGHT_ADJUST_MOBILE } from 'src/components/Media/Music/audioVisualizerBase';
import { lightBlue } from 'src/styles/colors';
import { screenM, screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight, playlistContainerWidth } from 'src/styles/variables';

interface AudioUIOwnProps {
    readonly currentPosition: number;
    readonly isPlaying: boolean;
    readonly onDrag: (percent: number) => void;
    readonly onStartDrag: (percent: number) => void;
    readonly pause: () => void;
    readonly play: () => void;
    readonly next: () => void;
    readonly prev: () => void;
    readonly seekAudio: (percent: number) => void;
    readonly isMobile: boolean;
    readonly isLoading: boolean;
    readonly isMouseMove: boolean;
    readonly radii: {
        readonly inner: number;
        readonly outer: number;
        readonly base: number;
    };
    readonly setMouseMove: (move: boolean) => void;
    readonly setRadii: (inner: number, outer: number, base: number) => void;
    readonly setHoverSeekring: (isHover: boolean, angle?: number) => void;
}

type AudioUIProps = AudioUIOwnProps;

interface AudioUIState {
    isHoverPlaypause: boolean;
    isHoverNext: boolean;
    isHoverPrev: boolean;
}

const loadingInstanceStyle = css`
    position: relative;
    left: 50%;
    top: calc(50% + ${HEIGHT_ADJUST_DESKTOP}px);
    transform: translateX(-50%) translateY(-50%);
    fill: none;
    stroke: ${lightBlue};

    ${screenXSorPortrait} {
        top: calc(50% + ${HEIGHT_ADJUST_MOBILE}px);
    }
`;

const LoadingOverlay = styled.div`
    position: absolute;
    z-index: 30;
    width: 100%;
    height: 100%;
    background-color: rgba(0 0 0 / 0.5);
`;

const UIContainer = styled.div`
    position: absolute;
    width: calc(100% - ${playlistContainerWidth.desktop});
    height: 100%;
    left: 0;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-around;

    ${screenM} {
        width: calc(100% - ${playlistContainerWidth.tablet});
    }

    ${screenXSorPortrait} {
        width: 100%;
        height: 360px;
        top: ${navBarHeight.mobile}px;
    }
`;

const StyledSeekRing = styled.canvas`
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
    -webkit-tap-highlight-color: transparent;
`;

const flipped = css({
    transform: 'scaleX(-1)'
});

type AggregateUIEvent<E> = React.MouseEvent<E> | React.TouchEvent<E> | TouchEvent;

class AudioUI extends React.Component<AudioUIProps, AudioUIState> {
    state = {
        isHoverPlaypause: false,
        isHoverNext: false,
        isHoverPrev: false,
    };
    playButton: HTMLDivElement | null = null;
    pauseButton: HTMLDivElement | null = null;

    height!: number;
    width!: number;
    centerX!: number;
    centerY!: number;
    timerId!: NodeJS.Timer;

    prevPercentage!: number;

    isDragging!: boolean;

    seekRing: HTMLCanvasElement | null = null;
    visualizationCtx: CanvasRenderingContext2D | null = null;

    listenerAdded = false;

    setPlayButtonRef = (ref: HTMLDivElement | null): void => {
        this.playButton = ref;
    }

    setPauseButtonRef = (ref: HTMLDivElement | null): void => {
        this.pauseButton = ref;
    }

    togglePlaying = <E extends Element>(event: React.KeyboardEvent<E> | React.MouseEvent<E> | KeyboardEvent | MouseEvent): void => {
        if ((event as React.KeyboardEvent<E> | KeyboardEvent).key === ' ' || (event as React.MouseEvent<E> | MouseEvent).button === 0) {
            if (this.props.isPlaying) {
                this.props.pause();
            } else {
                this.props.play();
            }
            event.preventDefault();
        }
    }

    onResize = (): void => {
        if (this.seekRing) {
            this.height = this.seekRing.offsetHeight;
            this.width = this.seekRing.offsetWidth;
            this.seekRing.height = this.height;
            this.seekRing.width = this.width;
            this.centerX = this.width / 2;
            this.centerY = this.height / 2 + (this.props.isMobile ? HEIGHT_ADJUST_MOBILE : HEIGHT_ADJUST_DESKTOP);
        }
    }

    initializeUI = (): void => {
        if (this.seekRing) {
            this.onResize();
            this.visualizationCtx = this.seekRing.getContext('2d');
            this.isDragging = false;
            this.props.setMouseMove(false);
            this.setState({
                isHoverPlaypause: false,
            });
        }
    }

    isMouseEvent = <E extends Element>(event: AggregateUIEvent<E>): event is React.MouseEvent<E> => {
        return event.type.match(/(m|M)ouse/) !== null;
    }

    getMousePositionInCanvas = <E extends Element>(event: AggregateUIEvent<E>): { x: number; y: number } => {
        if (!this.seekRing) {
            return {
                x: 0,
                y: 0
            };
        }
        const mouseX = (this.isMouseEvent(event)) ? event.clientX : event.touches[0].clientX;
        const mouseY = (this.isMouseEvent(event)) ? event.clientY : event.touches[0].clientY;
        const boundingRect = this.seekRing.getBoundingClientRect();
        return {
            x: mouseX - boundingRect.left,
            y: mouseY - boundingRect.top,
        };
    }

    isPointInCircle = (point: [number, number], radius: number, center: [number, number]): boolean => {
        const context = this.visualizationCtx;
        if (!context) {
            return false;
        }
        context.beginPath();
        context.arc(center[0], center[1], radius, 0, 2 * Math.PI);
        context.closePath();
        return context.isPointInPath(point[0], point[1]);
    }

    isEventInSeekRing = <E extends Element>(event: AggregateUIEvent<E>): boolean => {
        const { inner, outer } = this.props.radii;
        const canvasPos = this.getMousePositionInCanvas(event);
        const isInOuter = this.isPointInCircle([canvasPos.x, canvasPos.y], outer, [this.centerX, this.centerY]);
        const isInInner = this.isPointInCircle([canvasPos.x, canvasPos.y], inner, [this.centerX, this.centerY]);
        return isInOuter && !isInInner;
    }

    handleMousemove = <E extends Element>(event: AggregateUIEvent<E>, passive = true): void => {
        const prevMoving = this.props.isMouseMove;
        if (!this.seekRing) {
            return;
        }
        if (this.isDragging) {
            this.prevPercentage = this.mousePositionToPercentage(event);
            this.props.onDrag(this.prevPercentage);
            this.seekRing.style.cursor = this.isMouseEvent(event) ? 'pointer' : 'default';
            this.props.setMouseMove(false);
            if (!passive) {
                event.preventDefault();
            }
        } else {
            if (this.isEventInSeekRing(event) && !this.props.isMobile) {
                this.seekRing.style.cursor = 'pointer';
                this.props.setHoverSeekring(true, this.mousePositionToAngle(event));
                if (!prevMoving) {
                    this.props.setMouseMove(false);
                } else {
                    if (this.timerId) {
                        clearTimeout(this.timerId);
                    }
                    this.timerId = setTimeout(() => this.props.setMouseMove(false), 1000);
                }
            } else {
                this.seekRing.style.cursor = 'default';
                this.props.setHoverSeekring(false);
                if (this.timerId) {
                    clearTimeout(this.timerId);
                }
                this.props.setMouseMove(true);
                this.timerId = setTimeout(() => this.props.setMouseMove(false), 1000);
            }
        }
    }

    handleActiveMousemove = <E extends Element>(event: AggregateUIEvent<E>): void => {
        this.handleMousemove(event, false);
    }

    handleMouseup = <E extends Element>(event: React.MouseEvent<E> | React.TouchEvent<E>): void => {
        const prevMoving = this.props.isMouseMove;
        if (this.isDragging) {
            this.props.seekAudio(this.prevPercentage);
            this.isDragging = false;
            if (!prevMoving) {
                this.props.setMouseMove(false);
            } else {
                if (this.timerId) {
                    clearTimeout(this.timerId);
                }
                this.timerId = setTimeout(() => this.props.setMouseMove(false), 1000);
            }
            if (this.isMouseEvent(event) && !this.isEventInSeekRing(event) && this.seekRing) {
                this.seekRing.style.cursor = 'default';
            }
        }
    }

    mousePositionToPercentage = <E extends Element>(event: AggregateUIEvent<E>): number => {
        return this.mousePositionToAngle(event) / (2 * Math.PI);
    }

    mousePositionToAngle = <E extends Element>(event: AggregateUIEvent<E>): number => {
        const mousePos = this.getMousePositionInCanvas(event);
        const polar = cartesianToPolar(mousePos.x - this.centerX, mousePos.y - this.centerY);
        let angle = polar.angle + Math.PI / 2;
        if (angle < 0) {
            angle += Math.PI * 2;
        }
        return angle;
    }

    handleMousedown = <E extends Element>(event: React.MouseEvent<E> | React.TouchEvent<E>): void => {
        if (this.isEventInSeekRing(event)) {
            this.isDragging = true;
            this.prevPercentage = this.mousePositionToPercentage(event);
            this.props.onStartDrag(this.prevPercentage);
        }
    }

    handleMouseover = (state: keyof AudioUIState) => (): void => {
        this.setState({
            [state]: true,
        } as Pick<AudioUIState, keyof AudioUIState>, () => {
            if (this.props.isMobile) {
                setTimeout(() => this.setState({ [state]: true } as Pick<AudioUIState, keyof AudioUIState>));
            }
        });
    }

    handleMouseout = (state: keyof AudioUIState) => (): void => {
        this.setState({
            [state]: false,
        } as Pick<AudioUIState, keyof AudioUIState>);
    }

    componentDidUpdate(prevProps: AudioUIProps): void {
        if (prevProps.isMobile !== this.props.isMobile) {
            this.onResize();
        }
        if (prevProps.isPlaying !== this.props.isPlaying && !this.isDragging) {
            if (this.props.isPlaying) {
                gsap.fromTo(
                    this.playButton,
                    { opacity: 1, scale: 1, duration: 0.25 },
                    { opacity: 0, scale: 5, delay: 0.1, force3D: true, clearProps: 'transform' },
                );
            } else {
                gsap.fromTo(
                    this.pauseButton,
                    { opacity: 1, scale: 1, duration: 0.25 },
                    { opacity: 0, scale: 5, delay: 0.1, force3D: true, clearProps: 'transform' },
                );
            }
        }
    }

    componentDidMount(): void {
        window.addEventListener('keydown', this.togglePlaying);
        window.addEventListener('resize', this.onResize);
        this.initializeUI();
    }

    componentWillUnmount(): void {
        window.removeEventListener('keydown', this.togglePlaying);
        window.removeEventListener('resize', this.onResize);
        this.seekRing?.removeEventListener('touchmove', this.handleActiveMousemove);
    }

    render(): JSX.Element {
        const buttonLength = this.props.radii.base * Math.SQRT1_2;
        const verticalOffset = this.props.isMobile ? HEIGHT_ADJUST_MOBILE : HEIGHT_ADJUST_DESKTOP;
        return (
            <UIContainer>
                {this.props.isLoading && (
                    <LoadingOverlay>
                        <LoadingInstance
                            width={200}
                            height={200}
                            css={loadingInstanceStyle}
                        />
                    </LoadingOverlay>
                )}
                <PauseIcon
                    setRef={this.setPauseButtonRef}
                    width={buttonLength}
                    height={buttonLength}
                    verticalOffset={verticalOffset}
                />
                <PlayIcon
                    setRef={this.setPlayButtonRef}
                    width={buttonLength}
                    height={buttonLength}
                    verticalOffset={verticalOffset}
                />
                <SkipButton
                    key="prev-button"
                    onClick={this.props.prev}
                    isHovering={this.state.isHoverPrev}
                    onMouseMove={this.handleMousemove}
                    onMouseOver={this.handleMouseover('isHoverPrev')}
                    onMouseOut={this.handleMouseout('isHoverPrev')}
                    onMouseUp={this.handleMouseup}
                    width={buttonLength * 4 / 5}
                    height={buttonLength * 8 / 15}
                    verticalOffset={verticalOffset}
                    css={flipped}
                />
                {
                    (this.props.isPlaying) ? (
                        <PauseButton
                            key="pause-button"
                            onClick={this.togglePlaying}
                            isHovering={this.state.isHoverPlaypause}
                            onMouseMove={this.handleMousemove}
                            onMouseOver={this.handleMouseover('isHoverPlaypause')}
                            onMouseOut={this.handleMouseout('isHoverPlaypause')}
                            onMouseUp={this.handleMouseup}
                            width={buttonLength}
                            height={buttonLength}
                            verticalOffset={verticalOffset}
                        />
                    ) : (
                        <PlayButton
                            key="play-button"
                            onClick={this.togglePlaying}
                            isHovering={this.state.isHoverPlaypause}
                            onMouseMove={this.handleMousemove}
                            onMouseOver={this.handleMouseover('isHoverPlaypause')}
                            onMouseOut={this.handleMouseout('isHoverPlaypause')}
                            onMouseUp={this.handleMouseup}
                            width={buttonLength}
                            height={buttonLength}
                            verticalOffset={verticalOffset}
                        />
                    )
                }
                <SkipButton
                    key="next-button"
                    onClick={this.props.next}
                    isHovering={this.state.isHoverNext}
                    onMouseMove={this.handleMousemove}
                    onMouseOver={this.handleMouseover('isHoverNext')}
                    onMouseOut={this.handleMouseout('isHoverNext')}
                    onMouseUp={this.handleMouseup}
                    width={buttonLength * 4 / 5}
                    height={buttonLength * 8 / 15}
                    verticalOffset={verticalOffset}
                />
                <StyledSeekRing
                    ref={(canvas) => {
                        this.seekRing = canvas;
                        if (this.seekRing && !this.listenerAdded) {
                            this.seekRing.addEventListener('touchmove', this.handleActiveMousemove, { passive: false });
                            this.listenerAdded = true;
                        }
                    }}
                    onMouseMove={this.handleMousemove}
                    onMouseUp={this.handleMouseup}
                    onMouseDown={this.handleMousedown}
                    onTouchStart={this.handleMousedown}
                    onTouchMove={this.handleMousemove}
                    onTouchEnd={this.handleMouseup}
                />
            </UIContainer>
        );
    }
}

export default AudioUI;
