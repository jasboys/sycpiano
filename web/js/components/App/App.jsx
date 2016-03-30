import '@/less/app.less';
import '@/less/animations/route-animation.less';
import '@/less/animations/nav-bar-animation.less';

import React from 'react';
import {Motion, spring} from 'react-motion';
import Transition from 'react-motion-ui-pack';
import {RouteTransition} from 'react-router-transition';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import NavBar from '@/js/components/App/NavBar/NavBar.jsx';
import {LogoSVG} from '@/js/components/LogoSVG.jsx';
import Front from '@/js/components/App/Front/Front.jsx';


export default class App extends React.Component {
    state = {
        showFront: true,
        showNav: false
    };
    showFront = () => {
        this.setState({showFront: true});
        setTimeout(()=>this.setState({showNav: false}), 650);
    }
    hideFront = () => {
        this.setState({showFront: false});
        setTimeout(()=>this.setState({showNav: true}), 650);
    }
    componentDidMount = () => {
        window.addEventListener('wheel', this.hideFront);
    }
    render() {
        return (
            <div className='appContainer'>
                <LogoSVG/>
                <Front show={this.state.showFront} />
                <Motion style={{top: spring(this.state.showNav ? 0 : -90)}}>
                    {interpolated =>
                        <NavBar onClick={this.showFront} style={interpolated} />
                    }
                </Motion>
                <RouteTransition
                    pathname={this.props.location.pathname}
                    component='span'
                    runOnMount={true}
                    atEnter={{ opacity: 0 }}
                    atLeave={{ opacity: 0 }}
                    atActive={{ opacity: 1}}
                    style={{height: `100%`}}
                >
                    {this.props.children}
                </RouteTransition>
            </div>
        )
    }
};
