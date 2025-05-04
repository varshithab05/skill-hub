import { createSlice } from "@reduxjs/toolkit";

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    isSidebarMinimized: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarMinimized = !state.isSidebarMinimized;
    },
    closeSidebar: (state) => {
      state.isSidebarMinimized = false;
    },
    openSidebar: (state) => {
      state.isSidebarMinimized = true;
    },
  },
});

export const { toggleSidebar, closeSidebar, openSidebar } =
  sidebarSlice.actions;

export const selectIsSidebarMinimized = (state) =>
  state.sidebar.isSidebarMinimized;

export default sidebarSlice.reducer;
