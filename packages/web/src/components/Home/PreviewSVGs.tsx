import svgToMiniDataURI from 'mini-svg-data-uri';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

const previewStyle = css`
    height: 100%;
    width: 100%;
    object-fit: cover;
`;

const DesktopImg = styled.img(previewStyle, {
    objectPosition: '50% 50%',
});

const MobileImg = styled.img(previewStyle, {
    objectPosition: '50% 100%',
});

const desktopSVGString = ReactDOMServer.renderToStaticMarkup(
    (
        <svg xmlns="http://www.w3.org/2000/svg" width="2560" height="2320" viewBox="0 0 2560 2320">
            <filter id="a">
                <feGaussianBlur stdDeviation="12" colorInterpolationFilters="sRGB" />
            </filter>
            <path fill="#525345" d="M0 0h2560v2320H0z" />
            <g filter="url(#a)" transform="matrix(10 0 0 10 5 5)" fillOpacity=".5">
                <ellipse fill="#ece4d4" cx="79" cy="14" rx="105" ry="105" />
                <ellipse cx="157" cy="199" rx="119" ry="119" />
                <ellipse fill="#dadbc1" cx="59" cy="116" rx="33" ry="33" />
                <ellipse fill="#000d00" cx="21" cy="186" rx="50" ry="50" />
                <ellipse fill="#cebdb8" rx="1" ry="1" transform="matrix(-20.335 -75.48996 22.06965 -5.94498 158.2 63.5)" />
                <ellipse rx="1" ry="1" transform="matrix(0 -24.1468 25.69996 0 116.2 93.8)" />
                <ellipse fill="#eae3d6" rx="1" ry="1" transform="matrix(32.44157 -40.40043 27.46978 22.05825 68 26.3)" />
                <ellipse fill="#2b3009" cx="8" cy="73" rx="14" ry="200" />
                <ellipse fill="#12160b" cx="200" cy="188" rx="108" ry="108" />
                <path d="M91 49h25v19H91z" />
                <ellipse fill="#6e7e72" rx="1" ry="1" transform="matrix(14.48955 -35.68346 14.90198 6.05107 184.8 106.8)" />
                <path fill="#ffd2c1" d="M104.4 134.7l-15.7.4.4-18.6 17.5 11z" />
                <path fill="#b3b5a4" d="M23 65h70v64H23z" />
                <ellipse fill="#c8c8bb" rx="1" ry="1" transform="matrix(32.61143 39.29333 -20.237 16.79566 139 44.2)" />
                <ellipse fill="#3a3326" cx="224" cy="65" rx="39" ry="39" />
                <ellipse fill="#040500" rx="1" ry="1" transform="matrix(-195.3842 -14.691 1.45344 -19.3301 207 168.6)" />
                <path fill="#c8b7aa" d="M98.8 66.2l78.8-37.8-63.4 7 1.5 70.6z" />
                <ellipse fill="#3d692b" rx="1" ry="1" transform="matrix(-28.86048 6.0543 -2.11766 -10.09477 161.4 211)" />
                <path fill="#8f8154" d="M226 48.1L219.4-16h38.4l-3 36.4z" />
                <path fill="#97102c" d="M142 87h29v19h-29z" />
                <ellipse fill="#000005" cx="97" cy="92" rx="5" ry="29" />
                <ellipse fill="#173110" cx="52" cy="223" rx="63" ry="63" />
                <ellipse fill="#000009" rx="1" ry="1" transform="matrix(-8.0364 -48.54404 13.6286 -2.2562 131 119.1)" />
                <path fill="#939c88" d="M188 92l-26 46 22-109z" />
            </g>
        </svg>
    ),
);

const mobileSVGString = ReactDOMServer.renderToStaticMarkup(
    (
        <svg xmlns="http://www.w3.org/2000/svg" width="1779" height="2560" viewBox="0 0 1779 2560">
            <filter id="a">
                <feGaussianBlur stdDeviation="12" colorInterpolationFilters="sRGB" />
            </filter>
            <path fill="#656453" d="M0 0h1780v2560H0z" />
            <g filter="url(#a)" transform="matrix(10 0 0 10 5 5)" fillOpacity=".5">
                <ellipse fill="#e9e2cb" rx="1" ry="1" transform="matrix(-38.5349 93.82798 -44.33473 -18.20816 66.4 91.2)" />
                <ellipse cx="106" cy="255" rx="101" ry="101" />
                <ellipse fill="#efebe7" rx="1" ry="1" transform="rotate(179.5 53.8 65.4) scale(19.59195 26.9628)" />
                <ellipse fill="#c4c8b2" cx="38" cy="178" rx="25" ry="19" />
                <ellipse fill="#0f1b01" cx="2" cy="209" rx="18" ry="74" />
                <path fill="#111011" d="M68.3 122.4l-5.4 15.4 13 114.8 79.2-34.5z" />
                <ellipse fill="#dbd9d2" rx="1" ry="1" transform="matrix(21.55782 14.62274 -25.94586 38.25112 50.8 108.4)" />
                <ellipse fill="#1e1c15" rx="1" ry="1" transform="matrix(15.05406 -4.66834 29.5534 95.3013 159 149.4)" />
                <ellipse fill="#292201" rx="1" ry="1" transform="matrix(-20.25805 -9.8805 21.84687 -44.79273 156.9 22.2)" />
                <path fill="#141f15" d="M16.4 48.4l-42.2-20.6L3.6-32.4l42.2 20.6z" />
                <ellipse fill="#907d7b" rx="1" ry="1" transform="matrix(-3.45154 -26.08015 13.2884 -1.75864 118.3 169.1)" />
                <ellipse fill="#9f8f5c" cx="87" cy="15" rx="47" ry="38" />
                <ellipse fill="#bfbbad" cx="96" cy="83" rx="32" ry="32" />
                <path fill="#78744c" d="M0 60h17v106H0z" />
                <path fill="#3f4626" d="M46.6 35.8L25.9-16l16.8 93.1-6.5 12.2z" />
                <ellipse fill="#0b1509" rx="1" ry="1" transform="rotate(-3.7 3669.2 -2263) scale(30.19997 49.23216)" />
                <path fill="#b3b2a3" d="M69.2 180.7L18.7 135l-3.3 50.8 62 2.6z" />
                <path fill="#d0cebc" d="M20 43h12v105H20z" />
                <ellipse fill="#10140a" cx="39" cy="211" rx="177" ry="17" />
                <ellipse fill="#3d3c32" rx="1" ry="1" transform="matrix(-28.5745 -22.5668 16.3952 -20.75992 156.7 139.8)" />
                <ellipse fill="#c4b489" cx="67" cy="8" rx="30" ry="10" />
                <path fill="#87815d" d="M128.8 72.3h-.5L121.8 23l-95-13.3z" />
                <path fill="#000007" d="M64 174l15-7-11-24z" />
                <path fill="#766d6a" d="M72 127h8v60h-8z" />
            </g>
        </svg>
    ),
);

export const DesktopBackgroundPreview: React.FC<unknown> = () => (
    <DesktopImg src={svgToMiniDataURI(desktopSVGString)} />
);

export const MobileBackgroundPreview: React.FC<unknown> = () => (
    <MobileImg src={svgToMiniDataURI(mobileSVGString)} />
);
