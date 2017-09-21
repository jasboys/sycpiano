import '@/less/Media/loading-overlay.less';

import React from 'react';
import { Transition } from 'react-transition-group';
import { TweenLite } from 'gsap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const LoadingOverlay = (props) => (
    <Transition
        in={!this.props.isPlayerReady}
        onExit={(el) => { TweenLite.fromTo(el, 0.3, { opacity: 1 }, { opacity: 0, delay: 1 }) }}
        timeout={300}
        mountOnEnter={true}
        unmountOnExit={true}
        appear={true}
    >
        <div className="loading-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
                <defs>
                    <clipPath id="treble-mask">
                        <path d="M60.21 86.86C49.682 86.86 40 79.07 40 69.695c0-7.985 5.66-16.715 16.982-26.188a38.42 38.42 0 0 1-1.092-9.027c0-8.78 2.93-17.012 8.044-21.13 4.52 6.25 6.753 12.204 6.753 17.808 0 7.292-3.376 13.938-10.774 20.188l2.185 10.466c1.19-.1 1.887-.15 1.986-.15C70.687 61.663 76 66.72 76 73.318c0 4.813-3.626 9.373-8.938 11.954-.05-.346 2.135 9.475 2.135 10.862 0 6.202-5.66 10.518-12.313 10.518-4.966 0-9.087-3.325-9.087-8.385 0-3.62 2.483-6.398 6.107-6.398 3.178 0 5.66 3.176 5.66 6.2 0 3.422-2.878 5.755-6.702 6.15 1.49.745 3.078 1.142 4.717 1.142 5.362 0 10.33-4.067 10.33-8.93 0-.494-.05-.992-.15-1.536l-1.89-9.178c-1.59.795-3.326 1.143-5.66 1.143zM54.697 73.81c0 2.532 1.34 4.664 4.072 6.35-4.47-.693-7.448-3.62-7.448-7.786 0-4.91 4.37-9.276 9.534-10.366l-2.085-9.92c-9.284 6.944-14.2 13.74-14.2 20.336 0 7.29 6.952 13.292 14.996 13.292 2.334 0 4.27-.396 6.006-1.338L62 67.317c-4.125.545-7.302 3.073-7.302 6.495zm10.13-53.368c-4.122 0-7.2 9.176-7.2 17.508 0 1.736.098 3.324.446 4.762 6.703-5.952 10.13-11.358 10.13-16.17 0-2.33-.846-4.315-2.483-6-.247-.05-.545-.1-.893-.1zm6.9 54.71c0-4.117-2.977-8.136-7.248-8.136-.148 0-.546.05-1.24.1l3.524 16.565c3.227-2.38 4.965-5.257 4.965-8.53z" />
                    </clipPath>
                </defs>
                <circle id="background-circle" cx="60" cy="60" r="60" />
                <image className="loading-gif" x="0" y="0" height="120" width="120" xlinkHref="/images/loading-unmask.gif" />
            </svg>
        </div>
    </Transition>
);

LoadingOverlay.PropTypes = {
    isPlayerReady: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => ({
    isPlayerReady: state.video_player.isPlayerReady
});

export default connect(
    mapStateToProps,
    null
)(LoadingOverlay)
