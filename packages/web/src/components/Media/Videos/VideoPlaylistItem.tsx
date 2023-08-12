import { css } from '@emotion/react';
import styled from '@emotion/styled';
import addMilliseconds from 'date-fns/addMilliseconds';
import format from 'date-fns/format';
import intervalToDuration from 'date-fns/intervalToDuration';
import parseISO from 'date-fns/parseISO';
import parseDuration from 'parse-iso-duration';
import { lighten } from 'polished';
import * as React from 'react';
import ClampLines from 'react-clamp-lines';
import { useNavigate } from 'react-router-dom';

import { toMedia } from 'src/mediaQuery.js';
import { VideoItemShape } from 'src/components/Media/Videos/types';
import { screenPortrait, screenXS } from 'src/screens.js';
import { lightBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';

// Helper functions

const cjkRegex =
    /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;

function videoDurationToDisplay(durationString: string) {
    const helperDate = new Date();
    const nextDate = addMilliseconds(helperDate, parseDuration(durationString));
    const duration = intervalToDuration({
        start: helperDate,
        end: nextDate,
    });
    const s = duration.seconds || 0;
    const m = duration.minutes || 0;
    const h = duration.hours || 0;

    const sString = `${s < 10 ? '0' : ''}${s}`;
    const mString = `${m < 10 ? '0' : ''}${m}`;
    const hString = h > 0 ? `${h}:` : '';

    return `${hString}${mString}:${sString}`;
}

function publishedDateToDisplay(publishedAt: string) {
    return format(parseISO(publishedAt), 'MMM d, yyyy');
}

type VideoPlaylistItemProps = {
    readonly item: VideoItemShape;
    readonly currentItemId: number | string;
    readonly onClick: (isMobile: boolean, id: string) => void;
    readonly isMobile: boolean;
};

const padding = 10;

const itemHeight = 100;
const aspectRatio = 4 / 3;
const thumbnailWidth = (itemHeight - padding * 2) * aspectRatio;

const section = css({ verticalAlign: 'middle' });

const ImageContainer = styled.div(section, {
    height: '100%',
    width: thumbnailWidth,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 5,
});

const ImgStyle = (active: boolean) =>
    css({
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: active ? 'brightness(75%)' : 'saturate(75%) brightness(75%)',
        verticalAlign: 'middle',
        [toMedia([screenXS, screenPortrait])]: {
            filter: active ? 'unset' : 'brightness(75%)',
        },
    });

const StyledVideoItem = styled.li<{ active: boolean }>(
    css`
        list-style: none;
        cursor: pointer;
        width: 100%;
        height: ${itemHeight}px;
        padding: ${padding}px 0 ${padding}px 15px;
        border-left: 7px solid transparent;
        transition: all 0.15s;
        display: flex;

        &:hover {
            background-color: rgba(255 255 255 / 1);

            ${`${ImageContainer} img`} {
                filter: brightness(80%);
            }
        }
    `,
    (props) =>
        props.active &&
        css`
        border-left-color: ${lightBlue};
        background-color: rgba(255 255 255 / 1);
    `,
);

const Duration = styled.span<{ active: boolean; children: string }>(
    // latoFont(300),
    {
        position: 'absolute',
        right: 0,
        bottom: 0,
        paddingRight: 3,
        fontSize: '0.8rem',
    },
    ({ active }) => ({
        color: active ? lighten(0.2, lightBlue) : 'white',
    }),
    ({ active }) => latoFont(active ? 400 : 300),
);

const VideoInfo = styled.div(section, {
    width: 'calc(80% - 20px)',
    padding: '0 1.2rem',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
});

const h4style = css`
    margin: 0;
    color: black;
`;

const TextTop = styled(ClampLines)<{ isCJK: boolean }>(
    h4style,
    {
        paddingTop: 8,
        fontSize: '0.95rem',
        [toMedia([screenXS, screenPortrait])]: {
            fontSize: '0.85rem',
        },
    },
    ({ isCJK }) =>
        isCJK && {
            fontFamily: 'Noto Sans TC, sans-serif',
            fontWeight: 100,
        },
);

const TextBottom = styled.span(h4style, latoFont(400), {
    paddingBottom: 5,
    fontSize: '0.8rem',
    textAlign: 'right',
    [toMedia([screenXS, screenPortrait])]: {
        fontSize: '0.65rem',
    },
});

const VideoPlaylistItem: React.FC<VideoPlaylistItemProps> = ({
    item,
    currentItemId,
    onClick,
    isMobile,
}) => {
    const navigate = useNavigate();
    const thumbnailUrl =
        item?.snippet?.thumbnails &&
        (item.snippet.thumbnails.standard?.url ||
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.standard?.url);
    const active = currentItemId === item.id;
    const isCJK =
        !!item?.snippet?.title && !!item?.snippet?.title.match(cjkRegex);
    // const isCJK = false;
    return (
        <StyledVideoItem
            active={active}
            onClick={() => {
                navigate(`/media/videos/${item.id}`);
                if (item.id !== undefined) {
                    onClick(isMobile, item.id);
                }
            }}
        >
            <ImageContainer>
                <img
                    css={ImgStyle(active)}
                    alt="Sean Chen Piano Video"
                    src={thumbnailUrl}
                />
                <Duration active={active}>
                    {item?.contentDetails?.duration === undefined
                        ? ''
                        : videoDurationToDisplay(item.contentDetails.duration)}
                </Duration>
            </ImageContainer>
            <VideoInfo>
                <TextTop
                    isCJK={isCJK}
                    id={`${item.id}-info`}
                    text={item?.snippet?.title || ''}
                    lines={2}
                    ellipsis="..."
                    buttons={false}
                />
                <TextBottom>
                    {item?.statistics?.viewCount || '--'} views | published on{' '}
                    {item?.snippet?.publishedAt === undefined
                        ? '--'
                        : publishedDateToDisplay(item.snippet.publishedAt)}
                </TextBottom>
            </VideoInfo>
        </StyledVideoItem>
    );
};

export default VideoPlaylistItem;
