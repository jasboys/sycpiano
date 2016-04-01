import '@/less/app.less';

import React from 'react';
import ReactDOM from 'react-dom'
import {Motion, spring} from 'react-motion';
import {RouteTransition} from 'react-router-transition';
import TweenLite from 'gsap';

import NavBar from '@/js/components/App/NavBar/NavBar.jsx';
import {LogoSVG} from '@/js/components/LogoSVG.jsx';
import Front from '@/js/components/App/Front/Front.jsx';


export default class App extends React.Component {
    state = {
        showFront: true,
        showNav: false,
    };
    showFront = () => {
        this.setState({ showFront: true });
        //setTimeout(() => this.setState({ showNav: false }), 650);
        var el2 = ReactDOM.findDOMNode(this.refs.ref2);
        TweenLite.fromTo(ReactDOM.findDOMNode(this.refs.nav), 0.4, {top: '0px'}, {top: '-90px', delay: 0.65});
    }
    hideFront = () => {
        this.setState({ showFront: false });
        TweenLite.fromTo(ReactDOM.findDOMNode(this.refs.nav), 0.4,
            { top: '-90px' },
            { top: '0px', delay: 0.65, ease: Power1.easeOut });
        //setTimeout(() => this.setState({ showNav: true }), 650);
    }
    componentDidMount = () => {
        window.addEventListener('wheel', this.hideFront);
        window.addEventListener('keydown', e => {if (e.keyCode == 40) this.hideFront()});
    }
    render() {
        return (
            <div className='appContainer'>
                <LogoSVG/>
                <Front show={this.state.showFront} />
                <NavBar onClick={this.showFront} ref='nav' />
                <RouteTransition
                    pathname={this.props.location.pathname}
                    component='span'
                    runOnMount={true}
                    atEnter={{ opacity: 0 }}
                    atLeave={{ opacity: 0 }}
                    atActive={{ opacity: 1 }}
                    style={{ height: `100%` }}
                    >
                    {this.props.children}
                </RouteTransition>
            </div>
        )
    }
};
