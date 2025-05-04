import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userbids: [
        {
            _id: "674f0c657f0771ec84509d0e",
            amount: 5,
            job: {
                budget: {
                    min: 4,
                    max: 8
                },
                _id: "674f0c287f0771ec84509cf4",
                title: "fkjatlhtbfdkbjkwbvdnjkmq;la,",
                description: "knkb ndm ",
                employer: "6736d9af16d3355f9af8e318",
                status: "in-progress",
                bidAccepted: true,
                categories: [
                    "cdc",
                    "dcfsdf"
                ],
                skillsRequired: [
                    "dsfsf",
                    "sdfsf"
                ],
                createdAt: "2024-12-03T13:48:24.748Z",
                updatedAt: "2024-12-04T05:27:54.744Z",
                __v: 0,
                freelancer: "66f2a5f3b8add7538ab0b02e"
            },
            freelancer: "66f2a5f3b8add7538ab0b02e",
            status: "accepted",
            createdAt: "2024-12-03T13:49:25.548Z",
            updatedAt: "2024-12-04T05:27:54.721Z",
            __v: 0
        },
    ],
    bidDetails: {},  // New state to store individual bid details
    status: 'idle',
    error: null
};

const biddingSlice = createSlice({
    name: 'bids',
    initialState,
    reducers: {
        setBids: (state, action) => {
            state.userbids = action.payload;
        },
        setBidDetails: (state, action) => {
            state.bidDetails = action.payload;
        },
        updateBids: (state, action) => {
            state.userbids = {...state.userbids, ...action.payload};
        },
    },
});

// Export the actions
export const { setBids, setBidDetails, updateBids } = biddingSlice.actions;

// Selector to get all bids
export const selectBidsForUser = (state) => state.bids.userbids;

// Selector to get specific bid details
export const selectBidDetails = (state) => state.bids.bidDetails;

// Export the reducer
export default biddingSlice.reducer;
