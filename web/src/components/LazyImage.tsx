import Blazy from 'blazy';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import { Interpolation, Theme } from '@emotion/react';
import styled from '@emotion/styled';

import { LoadingInstance } from 'src/components/LoadingSVG';
import { lightBlue } from 'src/styles/colors';
import { fadeOnEnter, fadeOnExit } from 'src/utils';

const StyledLoadingInstance = styled(LoadingInstance)`
    position: absolute;
    height: 100px;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    padding: 10px;
    stroke: ${lightBlue};
`;

interface PictureGroupAttributes {
    readonly webp?: {
        readonly srcset?: string;
        readonly sizes?: string;
    };
    readonly jpg?: {
        readonly srcset?: string;
        readonly sizes?: string;
    };
    readonly src?: string;
}

interface LazyImageProps {
    readonly isMobile: boolean;
    readonly id?: string;
    readonly offset?: number;
    readonly container?: string;
    readonly mobileAttributes?: PictureGroupAttributes;
    readonly desktopAttributes?: PictureGroupAttributes;
    readonly csss?: {
        readonly mobile?: Interpolation<Theme>;
        readonly desktop?: Interpolation<Theme>;
        readonly loading?: Interpolation<Theme>;
    };
    readonly loadingComponent?: 'default' | React.ComponentType;
    readonly alt: string;
    readonly successCb?: (el?: Element | HTMLElement | HTMLImageElement) => void;
    readonly destroyCb?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = (props) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const blazy = React.useRef<BlazyInstance>();
    const mounted = React.useRef<boolean>(false);
    const timeout = React.useRef<NodeJS.Timeout>();

    const activateBlazy = React.useCallback(() => {
        blazy.current = new Blazy({
            selector: `#${props.id}`,
            offset: props.offset || Infinity,
            container: props.container ? `#${props.container}` : 'window',
            loadInvisible: true,
            success: (el: Element | HTMLElement) => {
                if (mounted.current) {
                    timeout.current = setTimeout(() => setIsLoaded(true), 250);
                    setIsLoaded(true);
                    props.successCb?.(el);
                }
            },
        });
    }, [props.id, props.offset, props.container, props.successCb]);

    React.useEffect(() => {
        if (mounted.current) {
            setIsLoaded(false);
            blazy.current?.revalidate();
        }
    }, [props.isMobile]);

    React.useEffect(() => {
        mounted.current = true;
        activateBlazy();
        return function unmount() {
            mounted.current = false;
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            blazy.current?.destroy();
        }
    }, []);

    const {
        mobileAttributes,
        desktopAttributes,
        csss,
        id,
        isMobile,
        alt,
        loadingComponent: LoadingComponent,
    } = props;
    let Loading: React.ComponentType | typeof StyledLoadingInstance | undefined;
    if (LoadingComponent === 'default') {
        Loading = StyledLoadingInstance;
    } else {
        Loading = LoadingComponent;
    }

    const sourceProps = isMobile ?
        {
            'data-srcset': mobileAttributes?.webp?.srcset,
            sizes: mobileAttributes?.webp?.srcset,
            type: 'image/webp',
        } :
        {
            'data-srcset': desktopAttributes?.webp?.srcset,
            sizes: desktopAttributes?.webp?.srcset,
            type: 'image/webp',
        };

    const imgProps = isMobile ?
        {
            id,
            css: csss?.mobile,
            'data-srcset': mobileAttributes?.jpg?.srcset,
            'data-src': mobileAttributes?.src,
            sizes: mobileAttributes?.jpg?.sizes,
            alt: alt,
        } :
        {
            id,
            css: csss?.desktop,
            'data-srcset': desktopAttributes?.jpg?.srcset,
            'data-src': desktopAttributes?.src,
            sizes: desktopAttributes?.jpg?.sizes,
            alt: alt,
        };


    return (
        <React.Fragment>
            <Transition<undefined>
                in={!!LoadingComponent && !isLoaded}
                mountOnEnter={true}
                unmountOnExit={true}
                onEnter={fadeOnEnter()}
                onExit={fadeOnExit()}
                timeout={250}
            >
                <div css={csss?.loading}>
                    {!!Loading ? <Loading /> : null}
                </div>
            </Transition>

            <picture key="mobile">
                <source {...sourceProps} />
                <img {...imgProps} />
            </picture>
        </React.Fragment>
    );
};