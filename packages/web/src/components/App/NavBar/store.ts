import { atom, type Setter } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import { debounce } from 'lodash-es';
import { toAtoms } from 'src/store.js';
import { findParent } from './links.js';
import type { NavBarStateShape } from './types.js';

const SCROLL_THRESHOLD = 10;

const initialState: NavBarStateShape = {
    isVisible: true,
    isExpanded: false,
    showSubs: [],
    lastScrollTop: 0,
    visiblePending: false,
    specificRouteName: '',
};

const navBarStore = atomWithImmer(initialState);
export const navBarAtoms = {
    ...toAtoms(navBarStore),
    isVisible: atom(
        (get) => get(navBarStore).isVisible,
        (get, set, show?: boolean) => {
            const definedShow = show ?? !get(navBarAtoms.isVisible);
            if (get(navBarAtoms.isVisible) !== definedShow) {
                set(debouncedNavBarToggle, definedShow);
            }
        },
    ),
    isExpanded: atom(
        (get) => get(navBarStore).isExpanded,
        (get, set, expanded?: boolean) => {
            const definedExpand = expanded ?? !get(navBarAtoms.isExpanded);
            const parentToExpand = findParent(
                get(navBarAtoms.specificRouteName),
            )?.name;
            if (definedExpand && parentToExpand !== undefined) {
                set(navBarStore, (draft) => {
                    draft.showSubs = [parentToExpand];
                });
            }
            set(navBarStore, (draft) => {
                draft.isExpanded = definedExpand;
            });
        },
    ),
    showSubs: atom(
        (get) => get(navBarStore).showSubs,
        (get, set, args: { sub?: string; isHamburger?: boolean }) => {
            if (get(navBarAtoms.visiblePending)) {
                return;
            }
            set(navBarStore, (draft) => {
                draft.visiblePending = true;
            });
            const { sub = '', isHamburger = false } =
                typeof args === 'object' ? args : {};
            let showSubs = get(navBarAtoms.showSubs);
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
            set(navBarStore, (draft) => {
                draft.showSubs = showSubs;
            });
            set(navBarStore, (draft) => {
                draft.visiblePending = false;
            });
        },
    ),
    specificRouteName: atom(
        (get) => get(navBarStore).specificRouteName,
        (_get, set, val: string) => {
            set(navBarStore, (draft) => (draft.specificRouteName = val));
        },
    ),
};

const debouncedToggleFn = debounce(
    (set: Setter, show: boolean) =>
        set(navBarStore, (draft) => {
            draft.isVisible = show;
        }),
    50,
    { leading: true },
);

const debouncedNavBarToggle = atom(null, (_get, set, show: boolean) => {
    debouncedToggleFn(set, show);
});

const callSub = atom(
    null,
    (get, set, args: { sub?: string; isHamburger?: boolean }) => {
        if (get(navBarAtoms.visiblePending)) {
            return;
        }
        set(navBarStore, (draft) => {
            draft.visiblePending = true;
        });
        const { sub = '', isHamburger = false } =
            typeof args === 'object' ? args : {};
        let showSubs = get(navBarAtoms.showSubs);
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
        set(navBarStore, (draft) => {
            draft.showSubs = showSubs;
        });
        set(navBarStore, (draft) => {
            draft.visiblePending = false;
        });
    },
);

const onScroll = atom(
    null,
    (
        get,
        set,
        triggerHeight: number,
        event: React.UIEvent<HTMLElement> | UIEvent,
    ) => {
        const scrollTop = (event.target as HTMLElement).scrollTop;

        const lastScrollTop = get(navBarAtoms.lastScrollTop);
        if (
            typeof triggerHeight !== 'number' ||
            Math.abs(scrollTop - lastScrollTop) <= SCROLL_THRESHOLD
        ) {
            return;
        }
        const showNavBar = !(
            scrollTop > lastScrollTop && scrollTop > triggerHeight
        );
        if (showNavBar !== get(navBarAtoms.isVisible)) {
            set(navBarAtoms.isVisible); // may need to be set.isVisible(!get.isVisible())
        }
        set(navBarStore, (draft) => {
            draft.lastScrollTop = scrollTop;
        });
    },
);

export const navBarActions = {
    onScroll,
};

// const isVisibleAtom = atom((get) => get(navBarStore).isVisible);
// const isExpandedAtom = atom((get) => get(navBarStore).isExpanded);
// const showSubsAtom = atom<string[]>((get) => get(navBarStore).showSubs);
// const lastScrollTopAtom = atom((get) => get(navBarStore).lastScrollTop);
// const visiblePendingAtom = atom((get) => get(navBarStore).visiblePending);
// const specificRouteNameAtom = atom((get) => get(navBarStore).specificRouteName);

// export const navBarAtoms = {
//     isVisible: isVisibleAtom,

// }

// interface NavBarActions {
//     debouncedToggle: (show: boolean) => void;
//     toggleNavBar: (show?: boolean) => void;
//     toggleExpanded: (expanded?: boolean) => void;
//     callSub: (args: { sub?: string; isHamburger?: boolean }) => void;
//     onScroll: (
//         triggerHeight: number,
//     ) => (event: React.UIEvent<HTMLElement> | UIEvent) => void;
// }

// export const navBarStore: StateCreator<
//     NavBarStateShape & NavBarActions,
//     [['zustand/immer', never]],
//     [],
//     NavBarStateShape & NavBarActions
//     >
//     (set) => ({
//     ...initialState,
//     debouncedToggle: debounce((show: boolean) => set.isVisible(show), 50, {
//         leading: true,
//     }),
// })

//     .extendActions((set, get, _api) => ({
//         toggleNavBar: (show?: boolean) => {
//             const definedShow = show ?? !get.isVisible();
//             if (get.isVisible() !== definedShow) {
//                 set.debouncedToggle(definedShow);
//             }
//         },
//         toggleExpanded: (expanded?: boolean) => {
//             const definedExpand = expanded ?? !get.isExpanded();
//             const parentToExpand = findParent(get.specificRouteName())?.name;
//             if (definedExpand && parentToExpand !== undefined) {
//                 set.showSubs([parentToExpand]);
//             }
//             set.isExpanded(definedExpand);
//         },
//         callSub: (args: { sub?: string; isHamburger?: boolean }) => {
//             if (get.visiblePending()) {
//                 return;
//             }
//             set.visiblePending(true);
//             const { sub = '', isHamburger = false } =
//                 typeof args === 'object' ? args : {};
//             let showSubs = get.showSubs();
//             if (isHamburger) {
//                 if (sub === '') {
//                     showSubs = [];
//                 } else if (showSubs.includes(sub)) {
//                     showSubs = showSubs.filter((value) => sub !== value);
//                 } else {
//                     showSubs = [...showSubs, sub];
//                 }
//             } else {
//                 if (sub === '' || sub === showSubs[0]) {
//                     showSubs = [];
//                 } else {
//                     showSubs = [sub];
//                 }
//             }
//             set.showSubs(showSubs);
//             set.visiblePending(false);
//         },
//     }))
//     .extendActions((set, get, _api) => ({
//         onScroll:
//             (triggerHeight: number) =>
//             (event: React.UIEvent<HTMLElement> | UIEvent): void => {
//                 const scrollTop = (event.target as HTMLElement).scrollTop;

//                 const lastScrollTop = get.lastScrollTop();
//                 if (
//                     typeof triggerHeight !== 'number' ||
//                     Math.abs(scrollTop - lastScrollTop) <= SCROLL_THRESHOLD
//                 ) {
//                     return;
//                 }
//                 const showNavBar = !(
//                     scrollTop > lastScrollTop && scrollTop > triggerHeight
//                 );
//                 if (showNavBar !== get.isVisible()) {
//                     set.toggleNavBar(); // may need to be set.isVisible(!get.isVisible())
//                 }
//                 set.lastScrollTop(scrollTop);
//             },
//     }));
