import '@/less/media/media-content.less';
import '@/less/media/videos/videos.less';

import React from 'react';
import ReactDOM from 'react-dom';
import {VelocityComponent, VelocityTransitionGroup} from 'velocity-react';
import VideoLoadingOverlay from '@/js/components/Media/LoadingOverlay.jsx';
import VideoPlaylistToggler from '@/js/components/Media/PlaylistToggler.jsx';
import VideoPlaylist from '@/js/components/Media/Videos/VideoPlaylist.jsx';
import ConnectPlaylistHOC from '@/js/components/Media/HigherOrder/ConnectPlaylistHOC.jsx';
import youTube from '@/js/YouTube.js';

const PLAYLIST_WIDTH = 550;

class Videos extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playerReady: false,
            playingVideoId: '',
            videos: {}
        };

        this.firstLoad = true;
    }

    onPlayerReady() {
        this.setState({
            playerReady: true,
            playingVideoId: this.state.videos[Object.keys(this.state.videos)[0]].id
        }, () => this.firstLoad = false);
    }

    playlistItemOnClick(videoId) {
        this.setState({ playingVideoId: videoId });
        this.playlistAutoHideTimeout = setTimeout(() => {
            this.props.togglePlaylist(false);
        }, 2500);
    }

    getVideosOnSuccess(response) {
        response.data.items.forEach((video) => {
            Object.assign(this.playlistItems[video.id], video);
        });

        this.setState({
            videos: this.playlistItems
        }, () => {
            this.playlistItems = null;
        });
    }

    getVideosOnError(response) {
        console.error(`get videos request failed: ${response}`);
    }

    getPlaylistItemsOnSuccess(response) {
        this.playlistItems = {};
        response.data.items.forEach((item) => {
            this.playlistItems[item.snippet.resourceId.videoId] = item;
        });

        youTube.getVideos(Object.keys(this.playlistItems))
            .then(this.getVideosOnSuccess.bind(this))
            .catch(this.getVideosOnError.bind(this));
    }

    getPlaylistItemsOnError(response) {
        console.error(`get playlistItems request failed: ${response.status}`);
    }

    componentWillMount() {
        youTube.getPlaylistItems()
            .then(this.getPlaylistItemsOnSuccess.bind(this))
            .catch(this.getPlaylistItemsOnError.bind(this));
    }

    componentDidMount() {
        youTube.initializePlayerOnElement(ReactDOM.findDOMNode(this));
        youTube.executeWhenPlayerReady(this.onPlayerReady.bind(this));
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.showPlaylist === prevProps.showPlaylist && this.state.playingVideoId !== prevState.playingVideoId)
            youTube.loadVideoById(this.state.playingVideoId, !this.firstLoad);
    }

    componentWillUnmount() {
        youTube.destroyPlayer();
    }

    render() {
        let overlayLeaveAnimation = { duration: 300, delay: 1000, animation: 'fadeOut' };
        let playlistExpandAnimation = { translateX: this.props.showPlaylist ? 0 : PLAYLIST_WIDTH + this.props.playlistRight };

        return (
            <div className="mediaContent videos">
                <VelocityTransitionGroup leave={overlayLeaveAnimation} runOnMount={false}>
                    { this.state.playerReady ? undefined : <VideoLoadingOverlay/> }
                </VelocityTransitionGroup>

                <VelocityComponent animation={playlistExpandAnimation} duration={400} easing={[170,26]}>
                    <VideoPlaylistToggler
                        playlistWidth={PLAYLIST_WIDTH}
                        playlistRight={this.props.playlistRight}
                        isPlaylistVisible={this.props.showPlaylist}
                        onClick={this.props.playlistToggleOnClick} />
                </VelocityComponent>

                <VelocityComponent animation={playlistExpandAnimation} duration={400} easing={[170,26]}>
                    <VideoPlaylist
                        currentItemId={this.state.playingVideoId}
                        items={this.state.videos}
                        playlistRightOnChange={this.props.playlistRightOnChange}
                        playlistItemOnClick={this.playlistItemOnClick.bind(this)} />
                </VelocityComponent>
            </div>
            );
    }
}

Videos.propTypes = {
    showPlaylist: React.PropTypes.bool.isRequired,
    playlistRight: React.PropTypes.number.isRequired,
    playlistRightOnChange: React.PropTypes.func.isRequired,
    playlistToggleOnClick: React.PropTypes.func.isRequired,
    togglePlaylist: React.PropTypes.func.isRequired
};

export default ConnectPlaylistHOC(Videos);