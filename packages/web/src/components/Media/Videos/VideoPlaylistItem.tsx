import parseDuration from 'parse-iso-duration';
import lighten from 'polished/lib/color/lighten';
import * as React from 'react';
import ClampLines from 'react-clamp-lines';
import { useNavigate } from 'react-router-dom';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import addMilliseconds from 'date-fns/addMilliseconds';
import format from 'date-fns/format';
import intervalToDuration from 'date-fns/intervalToDuration';
import parseISO from 'date-fns/parseISO';
import { VideoItemShape } from 'src/components/Media/Videos/types';
import { lightBlue, playlistBackground } from 'src/styles/colors';
import { lato1, lato2 } from 'src/styles/fonts';

// Helper functions

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

const section = ` vertical-align: middle; `;

const ImageContainer = styled.div`
    ${section}
    height: 100%;
    width: ${thumbnailWidth}px;
    position: relative;

    img {
        width: 100%;
        filter: saturate(50%) brightness(60%);
        vertical-align: middle;
    }
`;

const StyledVideoItem = styled.li<{ active: boolean }>(
    props => props.active && css`
        ${`${ImageContainer} img`} {
            filter: brightness(60%);
        }
    `,
    css`
        background-color: ${playlistBackground};
        list-style: none;
        cursor: pointer;
        width: 100%;
        height: ${itemHeight}px;
        padding: ${padding}px 0 ${padding}px 15px;
        border-left: 7px solid transparent;
        border-bottom: 1px solid rgba(120 120 120 / 0.3);
        transition: all 0.15s;
        display: flex;

        &:hover {
            background-color: rgba(255 255 255 / 1);

            ${`${ImageContainer} img`} {
                filter: brightness(60%);
            }
        }
    `,
    props => props.active && css`
        border-left-color: ${lightBlue};
        background-color: rgba(255 255 255 / 1);
    `,
);

const Duration = styled.span<{ active: boolean; children: string }>(props => css`
    position: absolute;
    right: 0;
    bottom: 0;
    color: ${(props.active) ? lighten(0.2, '#4E86A4') : '#fff'};
    font-family: ${(props.active) ? lato2 : lato1};
    padding-right: 3px;
`);

const VideoInfo = styled.div`
    ${section}
    width: calc(80% - 20px);
    padding: 0 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const h4style = css`
    margin: 0;
    color: black;
`;

const TextTop = styled(ClampLines)`
    ${h4style}
    padding-top: 5;
    font-size: 1rem;
    font-weight: bold;
`;

const TextBottom = styled.h4`
    ${h4style}
    padding-bottom: 5;
    font-size: 0.8rem;
`;

const VideoPlaylistItem: React.FC<VideoPlaylistItemProps> = ({ item, currentItemId, onClick, isMobile }) => {
    const navigate = useNavigate();
    const thumbnailUrl =
        item?.snippet?.thumbnails && (
            item.snippet.thumbnails.standard?.url ||
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.standard?.url
        );
    return (
        <StyledVideoItem
            active={currentItemId === item.id}
            onClick={() => {
                navigate(`/media/videos/${item.id}`);
                if (item.id !== undefined) {
                    onClick(isMobile, item.id);
                }
            }}
        >
            <ImageContainer>
                <img alt="Sean Chen Piano Video" src={thumbnailUrl} />
                <Duration active={currentItemId === item.id}>
                    {
                        (item?.contentDetails?.duration === undefined) ?
                            '' :
                            videoDurationToDisplay(item.contentDetails.duration)
                    }
                </Duration>
            </ImageContainer>
            <VideoInfo>
                <TextTop
                    id={`${item.id}-info`}
                    text={item?.snippet?.title || ''}
                    lines={2}
                    ellipsis="..."
                    buttons={false}
                />
                <TextBottom>
                    {item?.statistics?.viewCount || '--'} views
                        | published on {
                        (item?.snippet?.publishedAt === undefined) ?
                            '--' :
                            publishedDateToDisplay(item.snippet.publishedAt)
                    }
                </TextBottom>
            </VideoInfo>
        </StyledVideoItem>
    );
}

export default VideoPlaylistItem;
