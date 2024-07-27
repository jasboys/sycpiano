export type VideoItemShape = Youtube.PlaylistItem & Youtube.Video;

export interface VideoPlayerStateShape {
    readonly isPlayerReady: boolean;
    readonly videoId: string;
    readonly isPreviewOverlay: boolean;
    readonly isPlaying: boolean;
    readonly playlistVisible: boolean;
}
