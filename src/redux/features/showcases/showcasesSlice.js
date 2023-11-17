import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getShowcases } from "../../../utilities/firestore-crud";

export const showcasesSlice = createSlice({
  name: "showcases",
  initialState: {
    loading: false,
    error: "",
    showcases: [{ title: "example" }],
    isOpenSidebar: false,
    selectedShowcase: {
      title: "example",
      previewUrl: "http://example.com/",
    },
    subchannels: [
      { name: "example", channel_url: "http://example.com", selected: false },
    ],
    selectedSubchannel: {
      name: "example",
      channel_url: "http://example.com",
      selected: false,
    },
    readmeSourceProject: {
      repo: "https://github.com/",
      markup: "# Example",
      sha: null,
      path: null,
    },
    readmeSourceSubchannel: {
      repo: "https://github.com/",
      markup: "# Example",
      sha: null,
      path: null,
    },
    editMode: false,
    iFrame: {
      title: "example",
      url: "http://example.com/",
    },
  },
  reducers: {
    setOpenSidebar: (state, action) => {
      state.isOpenSidebar = action.payload;
    },
    setShowcases: (state, action) => {
      state.showcases = action.payload;
    },
    setSelectedShowcase: (state, action) => {
      state.selectedShowcase = action.payload;
    },
    setSubchannels: (state, action) => {
      state.subchannels = action.payload;
    },
    setSelectedSubchannel: (state, action) => {
      const currSelected = state.selectedSubchannel;
      if (currSelected.name === action.payload.name) {
        return;
      }
      state.subchannels = state.subchannels.map((sub) => {
        if (sub.name === currSelected.name) {
          sub.selected = false;
          return sub;
        }
        if (sub.name === action.payload.name) {
          sub.selected = true;
          return sub;
        }
        return sub;
      });
      state.selectedSubchannel = action.payload;
    },
    setReadmeSourceSubchannel: (state, action) => {
      state.readmeSourceSubchannel = action.payload;
    },
    setReadmeSourceProject: (state, action) => {
      state.readmeSourceProject = action.payload;
    },
    setIframe: (state, action) => {
      state.iFrame = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeShowcases.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(initializeShowcases.fulfilled, (state, action) => {
      state.loading = false;
      state.showcases = action.payload;
      state.error = "";
    });
    builder.addCase(initializeShowcases.rejected, (state, action) => {
      state.loading = false;
      //   state.showcases = [];
      state.error = action.error.message;
    });
  },
});
export const {
  setOpenSidebar,
  setShowcases,
  setSelectedShowcase,
  setSubchannels,
  setSelectedSubchannel,
  setReadmeSourceSubchannel,
  setReadmeSourceProject,
  setIframe,
} = showcasesSlice.actions;

//generates pending fulfilled and rejected action type
export const initializeShowcases = createAsyncThunk(
  "showcases/getShowcases",
  () =>
    getShowcases().then((showcases) => {
      return showcases;
    })
);
