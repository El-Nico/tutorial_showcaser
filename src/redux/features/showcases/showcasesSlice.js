import {
  createAsyncThunk,
  createListenerMiddleware,
  createSlice,
} from "@reduxjs/toolkit";
import { getShowcases } from "../../../utilities/firestore-crud";
import { store } from "../../store";
import {
  COMMITTER,
  OWNER,
  create_update_file,
  getReadme,
  getRepoContents,
} from "../../../utilities/github-api";
import { generateUID } from "../../../utilities/general";

export const showcasesSlice = createSlice({
  name: "showcases",
  initialState: {
    loading: false,
    error: "",
    showcases: [{ title: "example" }],
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
    readmeSourceProject: { url: "https://github.com/", markup: "# Example" },
    readmeSourceSubchannel: { url: "https://github.com/", markup: "# Example" },
    editMode: false,
    iFrame: {
      title: "example",
      url: "http://example.com/",
    },
  },
  reducers: {
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
        console.log("sane one");
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
      store.dispatch(setSelectedShowcase(showcases[0]));
      return showcases;
    })
);
export const setSelectedShowcaseMiddleware = createListenerMiddleware();

setSelectedShowcaseMiddleware.startListening({
  actionCreator: setSelectedShowcase,
  effect: async (action, listenerApi) => {
    //run async logic here
    const selectedShowcase = action.payload;
    //dispatch readme and iframe(if no subchannels and has main preview ess my website)
    //readme

    getReadme(OWNER, selectedShowcase.id, "")
      .then((res) => {
        const source = window.atob(res.data.content);
        store.dispatch(
          setReadmeSourceProject({
            url: selectedShowcase.id,
            markup: source,
          })
        );
      })
      .catch((err) => {
        if (err.status === 404) {
          //sha not required here because its a catch from 404 therefore not an update
          //create a readme file here and dispatch state
          const content = window.btoa(`# ${selectedShowcase.id}`);
          const commitMessage = "create update project Readme " + generateUID();
          create_update_file(
            OWNER,
            selectedShowcase.id,
            "README.MD",
            commitMessage,
            COMMITTER,
            content
          );
        }
      });

    let subchannels = [];
    if (selectedShowcase.previewUrl) {
      subchannels.push({
        mainPreview: true,
        name: "Main Preview",
        url: selectedShowcase.previewUrl,
        selected: false,
      });
    }
    if (selectedShowcase.subchannels) {
      ///could make this code section more elegant with async/await
      getRepoContents(OWNER, selectedShowcase.id, "").then((repoContents) => {
        const subs = repoContents.data
          .filter((content) => !content.name.toLowerCase().endsWith(".md"))
          .map((sub) => {
            return { ...sub, selected: false };
          });
        subchannels.push(...subs);
        store.dispatch(setSubchannels(subchannels));
      });
    } else {
      store.dispatch(setSubchannels(subchannels));
      //dispatch iframe here
    }
  },
});

//the only thing set subchannels middleware should do is
//store.dispatch setselectedsuchannel(subchannesl[0])

//then the setselected subchannel middleware should handle the rest

export const setSubchannelsMiddleware = createListenerMiddleware();

setSubchannelsMiddleware.startListening({
  actionCreator: setSubchannels,
  effect: async (action, listenerApi) => {
    const selectedSubchannel = action.payload[0];
    const state = listenerApi.getState();
    store.dispatch(setSelectedSubchannel(selectedSubchannel));
  },
});

export const setSelectedSubchannelMiddleware = createListenerMiddleware();

setSelectedSubchannelMiddleware.startListening({
  actionCreator: setSelectedSubchannel,
  effect: async (action, listenerApi) => {
    const selectedSubchannel = action.payload;
    const state = listenerApi.getState();
    //handle iframe here
    const currentPreview = state.showcases.selectedShowcase.subchannels.find(
      (subch) => subch.lessonName === selectedSubchannel.name
    );
    store.dispatch(
      setIframe({
        title: currentPreview.lessonName,
        url: currentPreview.channel_url,
      })
    );
    //readme for selected subchannel only here because its dependent
    const selectedShowcaseId = state.showcases.selectedShowcase.id;
    getReadme(OWNER, selectedShowcaseId, selectedSubchannel.name)
      .then((res) => {
        const source = window.atob(res.data.content);
        store.dispatch(
          setReadmeSourceSubchannel({
            url: selectedSubchannel.name,
            markup: source,
          })
        );
      })
      .catch((err) => {
        console.log("errorhere", err, err.status);
        if (err.status === 404) {
          //sha not required here because its a catch from 404 therefore not an update
          //create a readme file here and dispatch state
          const source = `# ${selectedSubchannel.name}`;
          const content = window.btoa(source);
          const commitMessage =
            `create Readme for section ${selectedSubchannel.name} ` +
            generateUID();
          const path = selectedSubchannel.name + "/" + "README.MD";
          create_update_file(
            OWNER,
            selectedShowcaseId,
            path,
            commitMessage,
            COMMITTER,
            content
          ).then((res) => {
            console.log(res);
            store.dispatch(
              setReadmeSourceSubchannel({
                url: selectedSubchannel.name,
                markup: source,
              })
            );
          });
        }
      });
    //add a catch for not found here to create a default markup
  },
});

// next steps is application state linkeage with scroll
