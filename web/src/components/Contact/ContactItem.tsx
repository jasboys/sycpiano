import * as React from 'react';

import { css, SerializedStyles } from '@emotion/react';
import styled from '@emotion/styled';

import { gsap } from 'gsap';

import { ContactInfo } from 'src/components/Contact/ContactInfo';
import { ContactSocialMedia } from 'src/components/Contact/ContactSocialMedia';
import { ContactItemShape } from 'src/components/Contact/types';
import { LazyImage } from 'src/components/LazyImage';

import {
    generateSrcsetWidths,
    marthaWoodsContactPhotoUrl,
    resizedImage,
    seanChenContactPhotoUrl,
    staticImage,
} from 'src/styles/imageUrls';
import { pushed } from 'src/styles/mixins';
import { screenWidths, screenXSorPortrait } from 'src/styles/screens';
import { isImageElement } from 'src/utils';

const imageInsetShadowColor = '#222';
const alternateBackgroundColor = '#eee';

interface PhotoAttributes {
    jpg?: string;
    webp?: string;
    svg?: string;
    css: SerializedStyles;
    imgCss?: SerializedStyles;
}

const photosAttributesMap: Record<string, PhotoAttributes> = {
    'Sean Chen': {
        jpg: seanChenContactPhotoUrl(),
        webp: seanChenContactPhotoUrl('webp'),
        css: css({
            backgroundSize: 'cover',
            backgroundPosition: '0 28%',
        }),
    },
    'Martha Woods': {
        svg: marthaWoodsContactPhotoUrl(),
        css: css({
            backgroundSize: 'unset',
            backgroundPosition: '0 0',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }),
        imgCss: css({
            width: '90%',
        }),
    },
};

interface ImageContainerProps { bgImage?: string; contact: string }

const ImageContainer = styled.div<ImageContainerProps>(
    {
        backgroundAttachment: 'initial',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'black',
        visibility: 'hidden',
        flex: '0 0 55%',
        boxShadow:
            `inset 0 -15px 15px -15px ${imageInsetShadowColor}`,

        [screenXSorPortrait]: {
            height: '75vw',
            flex: 'unset',
            boxShadow:
                `inset 0 -15px 15px -15px ${imageInsetShadowColor},
                inset 0 15px 15px -15px ${imageInsetShadowColor}`,
        }
    },
    ({ contact }) => photosAttributesMap[contact].css,
    ({ bgImage }) => ({
        backgroundImage: bgImage ? `url(${bgImage})` : 'unset',
    }),
);

const StyledContactInfo = styled(ContactInfo)` flex: 1 0 31%; `;

const StyledContactSocialMedia = styled(ContactSocialMedia)` flex: 1 0 auto; `;

const imageLoaderStyle = css`
    visibility: hidden;
    position: absolute;
`;

const StyledContactItem = styled.div(
    pushed,
    {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        flex: '0 1 600px',
        width: '100%',

        '&:nth-of-type(2n)': {
            backgroundColor: alternateBackgroundColor,
        },

        [screenXSorPortrait]: {
            height: 'fit-content',
            paddingBottom: '3em',

            '&:not(:first-of-type)': {
                marginTop: 0,
            },
        },
    });

const ContactItem: React.FC<ContactItemShape> = (props) => {
    const [bgImage, setBgImage] = React.useState('');
    const bgRef = React.useRef<HTMLDivElement>(null);

    const onImageLoad = (el?: HTMLImageElement | HTMLElement | Element | undefined) => {
        if (el && isImageElement(el)) {
            setBgImage(el?.currentSrc)
        }
        gsap.to(
            bgRef.current,
            { autoAlpha: 1, duration: 0.3, delay: 0.2, clearProps: 'opacity' },
        );
    };

    const onImageDestroy = () => {
        if (bgRef.current) {
            gsap.to(
                bgRef.current,
                { autoAlpha: 0, duration: 0.1 },
            );
        }
    };

    const {
        name,
        position,
        phone,
        email,
        social,
        isMobile,
        website,
    }: Partial<ContactItemShape> = props;

    const { webp, jpg, svg, imgCss } = photosAttributesMap[name];
    const webpSrcSet = webp && generateSrcsetWidths(webp, screenWidths);
    const jpgSrcSet = jpg && generateSrcsetWidths(jpg, screenWidths);

    return (
        <StyledContactItem>
            <ImageContainer
                bgImage={bgImage}
                ref={bgRef}
                contact={name}
            >
                {(!svg) ?
                    (
                        <LazyImage
                            isMobile={isMobile}
                            id={`contact_lazy_image_${name.replace(/ /g, '_')}`}
                            csss={{
                                mobile: imageLoaderStyle,
                                desktop: imageLoaderStyle,
                            }}
                            mobileAttributes={{
                                webp: {
                                    srcset: webpSrcSet,
                                    sizes: '100vw',
                                },
                                jpg: {
                                    srcset: jpgSrcSet,
                                    sizes: '100vw',
                                },
                                src: jpg && resizedImage(jpg, { width: 640 }),
                            }}
                            desktopAttributes={{
                                webp: {
                                    srcset: webpSrcSet,
                                    sizes: '100vh',
                                },
                                jpg: {
                                    srcset: jpgSrcSet,
                                    sizes: '100vh',
                                },
                                src: jpg && resizedImage(jpg, { height: 1080 }),
                            }}
                            alt={`${name}`}
                            successCb={onImageLoad}
                            destroyCb={onImageDestroy}
                        />
                    ) : (
                        <img
                            src={staticImage(`${svg}`)}
                            css={imgCss}
                            onLoad={() => onImageLoad()}
                        />
                    )}
            </ImageContainer>

            <StyledContactInfo
                name={name}
                position={position}
                phone={phone}
                email={email}
                website={website}
            />

            <StyledContactSocialMedia social={social} />
        </StyledContactItem>
    );
};

export default ContactItem;
