import { createSlice} from "@reduxjs/toolkit";

const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    recentProjects: [
      {
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
    ],
    myJobPosts: [

    ], 
    error: null,
  },
  reducers: {
    setRecentProjects: (state, action) => {
      state.recentProjects = action.payload;
    },
    getRecentProjects: (state) => {
      return state.recentProjects;
    },
    setMyJobPosts: (state, action) => {
      state.myJobPosts = action.payload;
    },
    getMyJobPosts: (state) => {
      return state.myJobPosts;
    }
  }
});

// Export actions
export const { 
  setRecentProjects, 
  getRecentProjects,
  setMyJobPosts,
  getMyJobPosts
} = projectsSlice.actions;

// Export selectors
export const selectRecentProjects = (state) => state.projects.recentProjects;
export const selectMyJobPosts = (state) => state.projects.myJobPosts;

export default projectsSlice.reducer;
