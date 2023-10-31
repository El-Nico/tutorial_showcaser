import { createSlice } from "@reduxjs/toolkit";

export const applicationStateSlice = createSlice({
  name: "applicationState",
  initialState: {
    isLoggedIn: false,
    editMode: false,
    selectedMenuButton: "sectionPreview",
  },
  reducers: {
    setLoginState: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    toggleEditMode: (state, action) => {
      state.editMode = action.payload;
    },
    setSelectedMenuButton: (state, action) => {
      state.selectedMenuButton = action.payload;
    },
  },
});

export const { setLoginState, toggleEditMode, setSelectedMenuButton } =
  applicationStateSlice.actions;
