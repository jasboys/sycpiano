import { gsap } from 'gsap';
// import { gsap } from 'gsap'
import { getAge as _getAge, baseString, descriptions } from 'common';

export interface FormattedLocationShape {
    venue: string;
    street: string;
    stateZipCountry: string;
}

export const formatLocation = (location: string): FormattedLocationShape => {
    // Example location string:
    // Howard L. Schrott Center for the Arts, 610 W 46th St, Indianapolis, IN 46208, USA
    const [venue, street, ...rest] = location.split(', ');
    const stateZipCountry = `${rest[1]}, ${rest[2]}`;

    return { venue, street, stateZipCountry };
};

export const getViewportSize = (): { width: number; height: number } => ({
    width: Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0,
    ),
    height: Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0,
    ),
});

export const titleStringBase = baseString;

export const getAge = _getAge;

// map of page name to meta title strings
export const metaDescriptions = descriptions;

export const formatPrice = (price: number): string =>
    `$${(price / 100).toFixed(2)} USD`;

export const validateEmail = (email: string): boolean => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(
        email,
    );
};

export const fadeOnEnter =
    (delay = 0, duration = 0.25) =>
    (element: HTMLElement, isEntering?: boolean): void => {
        if (element) {
            // console.log('enter', element);
            // console.log(isEntering);
            gsap.fromTo(
                element,
                { autoAlpha: 0 },
                {
                    autoAlpha: 1,
                    delay: isEntering ? delay + 1 : delay,
                    duration,
                    ease: 'power1.inOut',
                },
            );
        }
    };

export const fadeOnExit =
    (delay = 0, duration = 0.25) =>
    (element: HTMLElement): void => {
        if (element) {
            // console.log('exit', element);
            gsap.fromTo(
                element,
                { autoAlpha: 1 },
                { autoAlpha: 0, delay, duration, ease: 'power1.inOut' },
            );
        }
    };

export const slideOnEnter =
    (delay = 0, duration = 0.25) =>
    (element: HTMLElement): void => {
        if (element) {
            gsap.fromTo(
                element,
                { autoAlpha: 1 },
                {
                    y: '0%',
                    delay,
                    duration,
                    clearProps: 'transform',
                    force3D: true,
                },
            );
        }
    };

export const slideOnExit =
    (delay = 0, duration = 0.25) =>
    (element: HTMLElement): void => {
        if (element) {
            gsap.to(element, { y: '-100%', delay, duration, force3D: true });
        }
    };

export const isImageElement = (
    el: HTMLImageElement | HTMLElement | Element,
): el is HTMLImageElement => {
    return (el as HTMLImageElement).currentSrc !== undefined;
};
