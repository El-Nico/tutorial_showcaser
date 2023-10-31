import "./Home.css";
import { useState, useEffect, useReducer } from "react";
import { getShowcases } from "../../utilities/firestore-crud";
import {
  OWNER,
  create_update_file,
  getReadme,
  getReadmez,
  getRepoContents,
} from "../../utilities/github-api";
import MDEditor from "@uiw/react-md-editor";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";

import { NavLink } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { setLoginState } from "../../redux/store";
import { auth } from "../../firebase";
import { Header } from "./shared/header/Header";
import Footer from "./shared/footer/Footer";
import Sidebar from "./sidebar/Sidebar";
import Main from "./main/Main";

//react state management 59:54 unneseaary pairing of useffect and usestate should be avoid
//ded

export function Home() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "SET_SHOWCASES":
          return { ...state, showcases: action.payload };
        case "SET_SELECTED_SHOWCASE":
          return { ...state, selectedShowcase: action.payload };
        case "SET_SELECTED_AND_ALL_SHOWCASES":
          return {
            ...state,
            showcases: action.payload.showcases,
            selectedShowcase: action.payload.selectedShowcase,
          };
        case "SET_MDSOURCE":
          return {
            ...state,
            mdSource: action.payload,
          };
        case "SET_MDSOURCE_SUBCHANNEL":
          return {
            ...state,
            mdSourceSubchannel: action.payload,
          };
        case "SET_SUBCHANNELS":
          return {
            ...state,
            subchannels: action.payload,
          };
        case "SET_EDIT_MODE":
          return {
            ...state,
            editMode: action.payload,
          };
        case "SET_IFRAME":
          return {
            ...state,
            iFrame: action.payload,
          };
      }
    },
    {
      showcases: [{ title: "example" }],
      selectedShowcase: {
        title: "example",
        previewUrl: "http://example.com/",
      },
      subchannels: [{ channel_url: "http://example.com" }],
      mdSource: { url: "https://github.com/", markup: "# Example" },
      mdSourceSubchannel: { url: "https://github.com/", markup: "# Example" },
      editMode: false,
      iFrame: {
        title: "example",
        url: "http://example.com/",
      },
    }
  );

  const isLoggedIn = useSelector((state) => state.applicationState.isLoggedIn);
  // let isLoggedIn = false;

  const showcaseState = useSelector((state) => state.showcases);
  // console.log(showcaseState);

  //get all showcases
  useEffect(() => {
    getShowcases().then((showcases) => {
      dispatch({
        type: "SET_SELECTED_AND_ALL_SHOWCASES",
        payload: { showcases: showcases, selectedShowcase: showcases[0] },
      });

      ///get list of showcases for selected showcase
      // const current = state.selectedShowcase;
      const current = showcases[0];
      if (current.hasSubchannels) {
        getRepoContents(OWNER, current.id, "").then((repoContents) => {
          const subchannels = repoContents.data.filter(
            (content) => !content.name.endsWith(".md")
          );
          dispatch({
            type: "SET_SUBCHANNELS",
            payload: subchannels,
          });
        });
      }

      getReadme(OWNER, current.id, "").then((res) => {
        let source = window.atob(res.data.content);
        // console.log(source);
        dispatch({
          type: "SET_MDSOURCE",
          payload: { url: current.id, markup: source },
        });

        // console.log(res);
        ///////////////testhere////////////////
        // const content = window.btoa("new stuffs4");
        // const sha = res.data.sha;
        // create_update_file(
        //   OWNER,
        //   "css_tutorials",
        //   "README.MD",
        //   "testing programmatic commit4",
        //   { name: "Nicholas Eruba", email: "nicholasc1665@yahoo.com" },
        //   content,
        //   sha
        // ).then((res) => {
        //   console.log(res);
        // });
      });
    });
  }, []);

  //css_tutorials/01_lesson/README.md
  //css_tutorials/02_lesson/readme.md
  //css_tutorials/03_lesson_css_colors/lesson.md

  function changeShowcase(e) {
    console.log(e.target.value);
    const selectedShowcase = state.showcases.find(
      (showcase) => showcase.title === e.target.value
    );
    dispatch({
      type: "SET_SELECTED_SHOWCASE",
      payload: selectedShowcase,
    });

    getReadme(OWNER, selectedShowcase.id, "").then((res) => {
      let source = window.atob(res.data.content);
      // console.log(source);
      dispatch({
        type: "SET_MDSOURCE",
        payload: { url: selectedShowcase.id, markup: source },
      });
    });

    let subchannels = [];
    if (selectedShowcase.previewUrl) {
      subchannels.push({
        mainPreview: true,
        name: "Main Preview",
        url: selectedShowcase.previewUrl,
      });
    }
    if (
      selectedShowcase.hasSubchannels &&
      selectedShowcase.hasSubchannels === true
    ) {
      getRepoContents(OWNER, selectedShowcase.id, "").then((repoContents) => {
        const subs = repoContents.data.filter(
          (content) => !content.name.endsWith(".md")
        );
        subchannels.push(...subs);
        dispatch({
          type: "SET_SUBCHANNELS",
          payload: subchannels,
        });
      });
    } else {
      dispatch({
        type: "SET_SUBCHANNELS",
        payload: subchannels,
      });
    }
  }

  function changePreview(subchannel) {
    if (subchannel.mainPreview) {
      dispatch({
        type: "SET_IFRAME",
        payload: { title: subchannel.name, url: subchannel.url },
      });
    } else {
      const currentPreview = state.selectedShowcase.subchannels.find(
        (subch) => subch.lessonName === subchannel.name
      );

      dispatch({
        type: "SET_IFRAME",
        payload: {
          title: currentPreview.lessonName,
          url: currentPreview.channel_url,
        },
      });
    }

    getReadme(OWNER, state.selectedShowcase.id, subchannel.name).then((res) => {
      let source = window.atob(res.data.content);
      // console.log(source);
      dispatch({
        type: "SET_MDSOURCE_SUBCHANNEL",
        payload: { url: subchannel.name, markup: source },
      });
    });
  }

  return (
    <div className="home">
      <Header showSelect={true} />
      <Main />
      <Sidebar />
      <Footer />
    </div>
  );
}
