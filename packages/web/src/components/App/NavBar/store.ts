import { debounce } from 'lodash-es';
import type { NavBarStateShape } from './types.js';
import { createStore } from 'zustand-x';
import { findParent } from './links.js';
import { zustandMiddlewareOptions } from 'src/utils.js';

const SCROLL_THRESHOLD = 10;

const initialState: NavBarStateShape = {
    isVisible: true,
    isExpanded: false,
    showSubs: [],
    lastScrollTop: 0,
    visiblePending: false,
    specificRouteName: '',
};

export const navBarStore = createStore('navbar')(
    initialState,
    zustandMiddlewareOptions,
)
    .extendActions((set, _get, _api) => ({
        debouncedToggle: debounce((show: boolean) => set.isVisible(show), 50, {
            leading: true,
        }),
    }))
    .extendActions((set, get, _api) => ({
        toggleNavBar: (show?: boolean) => {
            const definedShow = show ?? !get.isVisible();
            if (get.isVisible() !== definedShow) {
                set.debouncedToggle(definedShow);
            }
        },
        toggleExpanded: (expanded?: boolean) => {
            const definedExpand = expanded ?? !get.isExpanded();
            const parentToExpand = findParent(get.specificRouteName())?.name;
            if (definedExpand && parentToExpand !== undefined) {
                set.showSubs([parentToExpand]);
            }
            set.isExpanded(definedExpand);
        },
        callSub: (args: { sub?: string; isHamburger?: boolean }) => {
            if (get.visiblePending()) {
                return;
            }
            set.visiblePending(true);
            const { sub = '', isHamburger = false } =
                typeof args === 'object' ? args : {};
            let showSubs = get.showSubs();
            if (isHamburger) {
                if (sub === '') {
                    showSubs = [];
                } else if (showSubs.includes(sub)) {
                    showSubs = showSubs.filter((value) => sub !== value);
                } else {
                    showSubs = [...showSubs, sub];
                }
            } else {
                if (sub === '' || sub === showSubs[0]) {
                    showSubs = [];
                } else {
                    showSubs = [sub];
                }
            }
            set.showSubs(showSubs);
            set.visiblePending(false);
        },
    }))
    .extendActions((set, get, _api) => ({
        onScroll:
            (triggerHeight: number) =>
            (event: React.UIEvent<HTMLElement> | UIEvent): void => {
                const scrollTop = (event.target as HTMLElement).scrollTop;

                const lastScrollTop = get.lastScrollTop();
                if (
                    typeof triggerHeight !== 'number' ||
                    Math.abs(scrollTop - lastScrollTop) <= SCROLL_THRESHOLD
                ) {
                    return;
                }
                const showNavBar = !(
                    scrollTop > lastScrollTop && scrollTop > triggerHeight
                );
                if (showNavBar !== get.isVisible()) {
                    set.toggleNavBar(); // may need to be set.isVisible(!get.isVisible())
                }
                set.lastScrollTop(scrollTop);
            },
    }));
