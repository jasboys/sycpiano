import '@/less/app.less';

import React from 'react';
import ReactDOM from 'react-dom'
import {Motion, spring} from 'react-motion';
import TransitionGroup from 'react-addons-transition-group';

import {RouteTransition} from 'react-router-transition';
import TweenLite from 'gsap';

import NavBar from '@/js/components/App/NavBar/NavBar.jsx';
import {LogoSVG} from '@/js/components/LogoSVG.jsx';
import Front from '@/js/components/App/Front/Front.jsx';

class Transition extends React.Component {
    componentWillLeave(callback) {
        console.log(this.ref);
        TweenLite.fromTo(this.ref, 0.5,
            { opacity: '1' },
            { opacity: '0', onComplete: callback, ease: Power2.easeOut });
    }
    componentWillEnter(callback) {
        TweenLite.fromTo(this.ref, 0.5,
            { opacity: '0' },
            { opacity: '1', onComplete: callback, ease: Power2.easeOut });
    }
    componentDidMount(callback) {
        TweenLite.fromTo(this.ref, 0.5,
            { opacity: '0' },
            { opacity: '1', onComplete: callback, ease: Power2.easeOut });
    }
    render() {
        return (
            <span ref={(ref)=>this.ref=ref}>
                {this.props.children}
            </span>
        )
    }
};

export default class App extends React.Component {
    state = {
        showFront: true,
        showNav: false,
    };
    showFront = () => {
        this.setState({ showFront: true });
        var el2 = ReactDOM.findDOMNode(this.refs.ref2);
        TweenLite.fromTo(ReactDOM.findDOMNode(this.refs.nav), 0.4, {top: '0px'}, {top: '-90px', delay: 0.65});
    }
    hideFront = () => {
        this.setState({ showFront: false });
        TweenLite.to(ReactDOM.findDOMNode(this.refs.nav), 0.4,
            { top: '0px', delay: 0.65, ease: Power1.easeOut });
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
                <TransitionGroup>
                    <Transition key={this.props.location.pathname}>
                        {this.props.children}
                    </Transition>
                </TransitionGroup>
            </div>
        )
    }
};
