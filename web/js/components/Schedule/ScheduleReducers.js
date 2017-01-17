import moment from 'moment';

// Test data for now
const dummyEventItems = [
    {type: 'month', month: 'November'},
    {
        type: 'day',
        name: 'Lights, Camera, Action!',
        day: 18,
        time: '7:00PM',
        program: [
            'this is the first piece',
            'this is the second piece',
            'this is the third piece',
        ],
        collaborators: [
            'an orchestra',
            'a violinist',
            'an organist',
            'a dog',
        ],
    },
    {
        type: 'day',
        name: 'Lights, Camera, Action!',
        day: 19,
        time: '7:00PM',
        program: [
            'this is the first piece',
            'this is the second piece',
            'this is the third piece',
        ],
        collaborators: [
            'an orchestra',
            'a violinist',
            'an organist',
            'a dog',
        ],
    },
    {
        type: 'day',
        name: 'Lights, Camera, Action!',
        day: 20,
        time: '7:00PM',
        program: [
            'this is the first piece',
            'this is the second piece',
            'this is the third piece',
        ],
        collaborators: [
            'an orchestra',
            'a violinist',
            'an organist',
            'a dog',
        ],
    }
];

export const dateReducer = (state = moment(), action) => {
    switch (action.type) {
        case 'UPDATE_DATE':
            return action.date;
        default:
            return state;
    };
};

export const eventItemsReducer = (state = {
    items: [],
    isFetching: false,
}, action) => {
    console.log('===in reducer===');
    console.log(action);
    console.log(state);
    switch (action.type) {
        case 'FETCH_EVENTS_SUCCESS':
            return { items: action.fetchedEvents, isFetching: false };
        case 'FETCH_EVENTS':
            return state.isFetching ? state : { ...state, isFetching: true }
        default:
            return state;
    };
};
