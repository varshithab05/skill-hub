import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../Features";

// Create store with Redux Toolkit
const store = configureStore({
  reducer: rootReducer,
});

export default store;
