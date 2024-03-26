import { css, type Interpolation, type Theme } from '@emotion/react';
import * as React from 'react';

import { useAppSelector } from 'src/hooks';
import { toMedia } from 'src/mediaQuery';
import { screenM, screenPortrait, screenXS } from 'src/screens';
import { lightBlue } from 'src/styles/colors';
import { playlistWidth } from 'src/styles/variables';

interface ShuffleButtonProps {
    className?: string;
    onClick?: () => void;
    on?: boolean;
}

const upClass = css({
    cursor: 'pointer',
    filter: 'drop-shadow(0 5px 5px rgba(0 0 0 / 0.3))',
    transform: 'translateX(calc(100% * 2 / 3)) translateY(-1px) scale(1.05)',
});

const baseClass = (on?: boolean) =>
    css({
        position: 'fixed',
        bottom: 25,
        right: `calc(${playlistWidth.desktop} / 3)`,
        transform: 'translateX(calc(100% * 2 / 3))',
        zIndex: 50,
        filter: 'drop-shadow(0 2px 2px rgba(0 0 0 / 0.3))',
        transition: 'all 0.2s',
        backgroundColor: on ? lightBlue : '#999999',
        borderRadius: '50%',
        svg: {
            stroke: 'white',
            verticalAlign: 'middle',
            '#outline': {
                stroke: on ? lightBlue : '#999999',
                transition: 'all 0.2s',
            },
        },

        [toMedia(screenM)]: {
            right: `calc(${playlistWidth.tablet} / 3)`,
        },
        [toMedia([screenXS, screenPortrait])]: {
            bottom: 10,
            right: 'calc(100% / 3)',
        },
    });

const ShuffleButton: React.FC<ShuffleButtonProps> = ({ on, onClick }) => {
    const [extraClass, setExtraClass] =
        React.useState<Interpolation<Theme>>(null);
    const screenTouch = useAppSelector(
        ({ mediaQuery }) => mediaQuery.screenTouch,
    );

    return (
        <div
            css={[baseClass(on), extraClass]}
            onClick={onClick}
            onMouseDown={() => !screenTouch && setExtraClass(null)}
            onMouseOut={() => !screenTouch && setExtraClass(null)}
            onMouseOver={() => !screenTouch && setExtraClass(upClass)}
            onMouseUp={() => !screenTouch && setExtraClass(upClass)}
            onBlur={() => !screenTouch && setExtraClass(null)}
            onFocus={() => !screenTouch && setExtraClass(upClass)}
            onKeyUp={onClick}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 120"
                height="50"
                width="50"
            >
                <title>Shuffle Button</title>
                <path
                    d="M15 75H37.5Q48.75 75 60 60Q71.25 45 82.5 45H105"
                    fill="none"
                    stroke-style="solid"
                    strokeWidth="6"
                />
                <path
                    id="outline"
                    d="M15 45H37.5Q48.75 45 60 60Q71.25 75 82.5 75H105"
                    fill="none"
                    stroke-style="solid"
                    strokeWidth="15"
                />
                <path
                    d="M15 45H37.5Q48.75 45 60 60Q71.25 75 82.5 75H105"
                    fill="none"
                    stroke-style="solid"
                    strokeWidth="6"
                />
            </svg>
        </div>
    );
};

export default ShuffleButton;
