import { createSlice } from "@reduxjs/toolkit";

export const applicationStateSlice = createSlice({
  name: "applicationState",
  initialState: {
    isLoggedIn: false,
    editMode: false,
    selectedMenuButton: {
      section: "sectionPreview",
      offsetMap: {
        aboutProject: 0,
        sectionPreview: 0,
        aboutSection: 0,
      },
    },
    triggerMainScroll: false,
  },
  reducers: {
    setLoginState: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    toggleEditMode: (state, action) => {
      state.editMode = action.payload;
    },
    setSelectedMenuButton: (state, action) => {
      const pTop = action.payload.parent;
      const children = action.payload.children.reduce(
        (prev, curr) => {
          const returns = { ...prev };
          const chOffset = curr.top;
          const relChOffset = chOffset - pTop;

          const prevOffset = prev.el.top;
          const relPrevOffset = prevOffset - pTop;

          if (Math.abs(relChOffset) < Math.abs(relPrevOffset)) {
            returns.section = curr.key;
          }
          returns.el = curr;
          returns.offsetMap = { ...prev.offsetMap };
          returns.offsetMap[curr.key] = relChOffset;
          return returns;
        },
        {
          el: action.payload.children[0],
          offsetMap: {},
          section: action.payload.children[0].key,
        }
      );

      delete children.el;
      state.selectedMenuButton = children;
    },
    mainScrollTriggered: (state, action) => {
      state.triggerMainScroll = action.payload;
    },
  },
});

export const {
  setLoginState,
  toggleEditMode,
  setSelectedMenuButton,
  mainScrollTriggered,
} = applicationStateSlice.actions;
