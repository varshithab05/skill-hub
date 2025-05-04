import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../api/axiosInstance"; // Adjust the path accordingly

const initialState = {
  userProfile: {
    name: "",
    email: "",
    bio: "",
    info: {
      skills: [],
      portfolio: "",
      experience: [],
      profilePic: "",
    },
    previousWorks: [],
  },
};

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async () => {
    const response = await axiosInstance.get("/user/profile");
    return response.data.user;
  }
);

export const updateUserProfileThunk = createAsyncThunk(
  "profile/updateUserProfile",
  async (profileData) => {
    await axiosInstance.put("/user/profile", profileData);
    return profileData;
  }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        addSkill: (state, action) => {
            state.userProfile.info.skills.push(action.payload);
        },
        removeSkill: (state, action) => {
            state.userProfile.info.skills.splice(action.payload, 1);
        },
        addExperience: (state) => {
            state.userProfile.info.experience.push('');
        },
        removeExperience: (state, action) => {
            state.userProfile.info.experience.splice(action.payload, 1);
        },
        updateExperience: (state, action) => {
            const { index, value } = action.payload;
            state.userProfile.info.experience[index] = value;
        },
        addPreviousWork: (state) => {
            state.userProfile.previousWorks.push({ title: '', description: '', link: '' });
        },
        removePreviousWork: (state, action) => {
            state.userProfile.previousWorks.splice(action.payload, 1);
        },
        updatePreviousWork: (state, action) => {
            const { index, field, value } = action.payload;
            state.userProfile.previousWorks[index][field] = value;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.userProfile = action.payload;
            })
            .addCase(updateUserProfileThunk.fulfilled, (state, action) => {
                state.userProfile = { ...state.userProfile, ...action.payload };
            });
    },
});

export const {
    setUserProfile,
    addSkill,
    removeSkill,
    addExperience,
    removeExperience,
    updateExperience,
    addPreviousWork,
    removePreviousWork,
    updatePreviousWork,
} = profileSlice.actions;

export const selectUserProfile = (state) => state.profile.userProfile;

export default profileSlice.reducer;
