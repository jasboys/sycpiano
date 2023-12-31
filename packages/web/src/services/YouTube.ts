/// <reference types="youtube" />
/* global YT, GAPI_KEY */
import axios from 'axios';

// Restricted API key, okay to commit.
const API_KEY = GAPI_KEY;
const PLAYLIST_ID = 'PLzauXr_FKIlhzArviStMMK08Xc4iuS0n9';

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const PLAYLIST_ITEMS_URL = `${YOUTUBE_BASE_URL}/playlistItems`;
const VIDEOS_URL = `${YOUTUBE_BASE_URL}/videos`;
const MAX_PLAYLIST_ITEMS = 25;

/* NOTE: We might want to consider moving all properties on the YouTube class
 ** that don't need to be exposed to other modules into variables local to module. */

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
    }
}

class YouTube {
    private player: YT.Player | undefined = undefined;
    private playerReady: Promise<void> | undefined = undefined;
    private apiReady: Promise<void> | undefined = undefined;

    constructor() {
        this.apiReady = new Promise((resolve) => {
            window.onYouTubeIframeAPIReady = () => resolve();

            // load youtube api
            const body = document.body;
            const script = document.createElement('script');
            // script.src = `${window.location.protocol}//www.youtube.com/iframe_api?enablejsapi=1&origin=${window.location.protocol}//${window.location.host}`;
            script.src = 'https://www.youtube.com/iframe_api';
            body.insertBefore(script, body.firstChild);
        });
    }

    public async executeWhenPlayerReady(func: () => void) {
        if (!this.playerReady) {
            throw new Error(
                'initializePlayerOnElement must first be called before calling this function',
            );
        }

        await this.playerReady;
        func();
    }

    public async initializePlayerOnElement(el: HTMLElement, id = 'player') {
        // reinitiaize playerReady deferred
        this.playerReady = this.apiReady?.then(
            () =>
                new Promise((resolve) => {
                    // For now, only allow one player at a time.
                    this.destroyPlayer();

                    // element to be replace by iframe
                    const div = document.createElement('div');
                    div.id = id;
                    el.appendChild(div);

                    // create youtube player
                    this.player = new YT.Player(id, {
                        host: `${window.location.protocol}//www.youtube.com`,
                        events: {
                            onReady: () => {
                                resolve();
                            },
                        },
                        playerVars: {
                            rel: 0,
                            origin: `${window.location.protocol}//${window.location.host}`,
                        },
                    });
                }),
        );
        return this.playerReady;
    }

    public async loadVideoById(videoId: string, autoplay?: boolean) {
        await this.playerReady;
        if (autoplay) {
            this.player?.loadVideoById(videoId);
        } else {
            this.player?.cueVideoById(videoId);
        }
    }

    public playVideo() {
        if (this.player?.getPlayerState() === 5) {
            this.player?.playVideo();
        } else {
            console.error('No video cued, please use loadVideoById');
        }
    }

    public getPlaylistItems() {
        return axios.get<{ items: Youtube.PlaylistItem[] }>(
            PLAYLIST_ITEMS_URL,
            {
                params: {
                    key: API_KEY,
                    maxResults: MAX_PLAYLIST_ITEMS,
                    part: 'id, snippet',
                    playlistId: PLAYLIST_ID,
                },
            },
        );
    }

    public getVideos(listOfIds: string[]) {
        return axios.get<{ items: Youtube.Video[] }>(VIDEOS_URL, {
            params: {
                id: listOfIds.join(','),
                key: API_KEY,
                part: 'id, contentDetails, statistics',
            },
        });
    }

    public destroyPlayer() {
        if (this.player) {
            this.player.destroy();
            this.player = undefined;
            this.playerReady = undefined;
        }
    }
}

const youTube = new YouTube();

export default youTube;
