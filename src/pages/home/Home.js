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
import { selectUser, setUser } from "../../store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { NavLink } from "react-router-dom";

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
        case "SET_LOGIN_STATUS":
          return {
            ...state,
            isLoggedIn: action.payload,
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
      isLoggedIn: false,
      iFrame: {
        title: "example",
        url: "http://example.com/",
      },
    }
  );

  // let isLoggedIn = useSelector(selectUser);
  // let isLoggedIn = false;

  //user observable
  const r_dispatch = useDispatch();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        // console.log("uid", uid);
        r_dispatch(setUser(true));
        dispatch({
          type: "SET_LOGIN_STATUS",
          payload: true,
        });
      } else {
        // User is signed out
        // ...
        // console.log("user is logged out");
        r_dispatch(setUser(false));
        dispatch({
          type: "SET_LOGIN_STATUS",
          payload: false,
        });
      }
    });
  }, []);

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

  function updateReadme(x) {
    console.log(x);
  }

  return (
    <div className="App">
      <header className="header el">
        <div className="custom-select">
          <select
            value={state.selectedShowcase.title}
            onChange={(e) => {
              changeShowcase(e);
            }}
          >
            {state.showcases.map((showcase) => (
              <option key={showcase.title} value={showcase.title}>
                {showcase.title}
              </option>
            ))}
          </select>
          <span className="custom-arrow"></span>
        </div>
        <h1 className="logo">tutorial showcaser</h1>
        <h3>
          <NavLink to="/about">About</NavLink>
        </h3>
      </header>
      <main className="container">
        <div className="scroll">
          {/* toggle switch only available when logged in */}
          {state.isLoggedIn === true && (
            <label className="switch">
              <input
                type="checkbox"
                onClick={() => {
                  dispatch({
                    type: "SET_EDIT_MODE",
                    payload: state.editMode === false ? true : false,
                  });
                }}
              />
              <span className="slider round"></span>
            </label>
          )}
          <div className="box" id="about-box">
            {/* <MarkdownPreview source={state.mdSource} /> */}
            {state.editMode === false && (
              <MDEditor.Markdown source={state.mdSource.markup} />
            )}
            {state.editMode === true && (
              <>
                <MDEditor
                  height={"100%"}
                  value={state.mdSource.markup}
                  onChange={(e) => {
                    dispatch({
                      type: "SET_MDSOURCE",
                      payload: { url: state.mdSource.url, markup: e },
                    });
                  }}
                />
                <button
                  onClick={() => {
                    updateReadme(state.mdSource.url);
                  }}
                >
                  done
                </button>
              </>
            )}
          </div>
          <div className="box box2">
            <iframe
              src={state.iFrame.url}
              title={state.iFrame.title}
              width={"100%"}
              height={"100%"}
            ></iframe>
          </div>
          <div className="box box3">
            {/* <MarkdownPreview source={state.mdSource} /> */}
            {state.editMode === false && (
              <MDEditor.Markdown source={state.mdSourceSubchannel.markup} />
            )}
            {state.editMode === true && (
              <>
                <MDEditor
                  height={"100%"}
                  value={state.mdSourceSubchannel.markup}
                  onChange={(e) => {
                    dispatch({
                      type: "SET_MDSOURCE_SUBCHANNEL",
                      payload: { url: state.mdSourceSubchannel.url, markup: e },
                    });
                  }}
                />
                <button
                  onClick={() => {
                    updateReadme(state.mdSourceSubchannel.url);
                  }}
                >
                  done
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <aside className="sidebar el">
        <div className="home-subchannels">
          <button>About the Project</button>
          {state.subchannels.map((subchannel, i) => (
            <button
              key={i}
              onClick={(_) => {
                changePreview(subchannel);
              }}
            >
              {subchannel.name}
            </button>
          ))}
          <button>About this Section</button>
        </div>
        {/* <div className="home-showcase-readme">
          <NavLink to="/home#about-box">Readme.md</NavLink>
        </div> */}
      </aside>

      <footer className="footer el">
        <h2>Footer</h2>
      </footer>
    </div>
  );
}
