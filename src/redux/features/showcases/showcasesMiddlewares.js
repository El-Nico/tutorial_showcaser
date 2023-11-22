import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  COMMITTER,
  OWNER,
  create_update_file,
  getReadme,
  getRepoContents,
} from "../../../utilities/github-api";
import { generateUID } from "../../../utilities/general";
import { mainScrollTriggered } from "../application_state/application_state_slice";
import {
  setSelectedShowcase,
  setSubchannels,
  setSelectedSubchannel,
  setReadmeSourceSubchannel,
  setReadmeSourceProject,
  setIframe,
} from "./showcasesSlice";

export const setShowcasesMiddleware = createListenerMiddleware();

setShowcasesMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    return (
      currentState.showcases.showcases !== previousState.showcases.showcases
    );
  },
  effect: async (action, listenerApi) => {
    const showcases = action.payload.showcases;
    let selectedShowcase = showcases.find(
      (showcase) => showcase.title === action.payload.selectedShowcase
    );
    if (!selectedShowcase) {
      selectedShowcase = showcases[0];
      // Construct URLSearchParams object instance from current URL querystring.
      let queryParams = new URLSearchParams(window.location.search);

      // Set new or modify existing parameter value.
      queryParams.set("showcase", selectedShowcase.title);

      // Replace current querystring with the new one.
      window.history.replaceState(null, null, "?" + queryParams.toString());
    }

    listenerApi.dispatch(setSelectedShowcase(selectedShowcase));
  },
});

export const setSelectedShowcaseMiddleware = createListenerMiddleware();

setSelectedShowcaseMiddleware.startListening({
  actionCreator: setSelectedShowcase,
  effect: async (action, listenerApi) => {
    const selectedShowcase = action.payload;
    //dispatch readme and iframe(if no subchannels and has main preview ess my website)
    //readme

    getReadme(OWNER, selectedShowcase.id, "")
      .then((res) => {
        const source = window.atob(res.data.content);
        listenerApi.dispatch(
          setReadmeSourceProject({
            repo: selectedShowcase.id,
            markup: source,
            sha: res.data.sha,
            path: res.data.path,
          })
        );
      })
      .catch((err) => {
        if (err.status === 404) {
          //sha not required here because its a catch from 404 therefore not an update
          //create a readme file here and dispatch state
          const content = window.btoa(`# ${selectedShowcase.id}`);
          const commitMessage = "create project Readme " + generateUID();
          create_update_file(
            OWNER,
            selectedShowcase.id,
            "README.MD",
            commitMessage,
            COMMITTER,
            content
          ).then((res) => {
            listenerApi.dispatch(
              setReadmeSourceProject({
                repo: selectedShowcase.id,
                markup: content,
                sha: res.data.content.sha,
                path: res.data.content.path,
              })
            );
          });
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
        listenerApi.dispatch(setSubchannels(subchannels));
      });
    } else {
      listenerApi.dispatch(setSubchannels(subchannels));
      //dispatch iframe here
    }
  },
});

//the only thing set subchannels middleware should do is
//listenerApi.dispatch setselectedsuchannel(subchannesl[0])

//then the setselected subchannel middleware should handle the rest

export const setSubchannelsMiddleware = createListenerMiddleware();

setSubchannelsMiddleware.startListening({
  actionCreator: setSubchannels,
  effect: async (action, listenerApi) => {
    const selectedSubchannel = action.payload[0];
    listenerApi.dispatch(setSelectedSubchannel(selectedSubchannel));
  },
});

export const setSelectedSubchannelMiddleware = createListenerMiddleware();

setSelectedSubchannelMiddleware.startListening({
  actionCreator: setSelectedSubchannel,
  effect: async (action, listenerApi) => {
    const selectedSubchannel = action.payload;
    const state = listenerApi.getState();

    //readme for selected subchannel only here because its dependent
    const selectedShowcaseId = state.showcases.selectedShowcase.id;
    getReadme(OWNER, selectedShowcaseId, selectedSubchannel.name)
      .then((res) => {
        const source = window.atob(res.data.content);
        listenerApi.dispatch(
          setReadmeSourceSubchannel({
            repo: selectedShowcaseId,
            markup: source,
            sha: res.data.sha,
            path: res.data.path,
          })
        );
      })
      .catch((err) => {
        if (err.status === 404) {
          //sha not required here because its a catch from 404 therefore not an update
          //create a readme file here and dispatch state
          const source = `# ${selectedSubchannel.name}`;
          const content = window.btoa(source);
          const commitMessage =
            `create Readme for section ${selectedSubchannel.name} ` +
            generateUID();
          const path = selectedSubchannel.name + "/README.MD";
          create_update_file(
            OWNER,
            selectedShowcaseId,
            path,
            commitMessage,
            COMMITTER,
            content
          ).then((res) => {
            listenerApi.dispatch(
              setReadmeSourceSubchannel({
                repo: selectedShowcaseId,
                markup: source,
                sha: res.data.content.sha,
                path: res.data.content.path,
              })
            );
          });
        }
      });

    listenerApi.dispatch(mainScrollTriggered(true));
    //handle iframe here
    if (selectedSubchannel.mainPreview) {
      listenerApi.dispatch(
        setIframe({
          title: selectedSubchannel.name,
          url: selectedSubchannel.url,
        })
      );
      return;
    }
    const currentPreview = state.showcases.selectedShowcase.subchannels.find(
      (subch) => subch.lessonName === selectedSubchannel.name
    );
    listenerApi.dispatch(
      setIframe({
        title: currentPreview.lessonName,
        url: currentPreview.channel_url,
      })
    );
  },
});
