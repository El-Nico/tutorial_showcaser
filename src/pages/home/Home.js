import "./Home.css";
import { useState, useEffect, useReducer } from "react";
import { getShowcases } from "../../utilities/firestore-crud";
import { OWNER, getReadmez, getRepoContents } from "../../utilities/github-api";
import MDEditor from "@uiw/react-md-editor";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../../store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { NavLink } from "react-router-dom";

//react state management 59:54 unneseaary pairing of useffect and usestate should be avoid
//ded

export function Home() {
  const [lessons, updateLessons] = useState([]);
  const [selectLesson, updateSelectLesson] = useState({});

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
      }
    },
    {
      showcases: [{ title: "example" }],
      selectedShowcase: {
        title: "example",
        previewUrl: "http://example.com/",
      },
      subchannels: [{ channel_url: "http://example.com" }],
      mdSource: "# Example",
      editMode: false,
      isLoggedIn: false,
    }
  );

  let isLoggedIn = useSelector(selectUser);
  // let isLoggedIn = false;
  console.log(isLoggedIn);

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
      const current = state.selectedShowcase;
      if (current.hasSubchannels) {
        getRepoContents(OWNER, current.id, "").then((repoContents) => {
          console.log(repoContents);
          const subchannels = repoContents.data.filter(
            (content) => !content.name.endsWith(".md")
          );
          dispatch({
            type: "SET_SUBCHANNELS",
            payload: subchannels,
          });
        });
      }
    });

    //github stuff
    getReadmez("react_state_management", "/README.md", "El-Nico").then(
      (res) => {
        let source = window.atob(res.data.content);
        // console.log(source);
        dispatch({
          type: "SET_MDSOURCE",
          payload: source,
        });
      }
    );
  }, []);
  console.log("editmode", state.editMode);
  return (
    <div className="App">
      <header className="header el">
        <div className="custom-select">
          <select
            value={state.showcases[0].title}
            onChange={(e) => {
              const selectedShowcase = state.showcases.find(
                (showcase) => showcase.title === e.target.value
              );
              dispatch({
                type: "SET_SELECTED_SHOWCASE",
                payload: selectedShowcase,
              });
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
              <span class="slider round"></span>
            </label>
          )}
          <div className="box" id="about-box">
            {/* <MarkdownPreview source={state.mdSource} /> */}
            {state.editMode === false && (
              <MDEditor.Markdown source={state.mdSource} />
            )}
            {state.editMode === true && (
              <MDEditor
                height={"100%"}
                value={state.mdSource}
                onChange={(e) => {
                  dispatch({
                    type: "SET_MDSOURCE",
                    payload: e,
                  });
                }}
              />
            )}
          </div>
          <div className="box box2">
            <iframe
              src={state.selectedShowcase.previewUrl}
              title={state.selectedShowcase.title}
              width={"100%"}
              height={"100%"}
            ></iframe>
          </div>
          <div className="box box3"></div>
        </div>
      </main>
      <aside className="sidebar el">
        <div className="home-subchannels">
          <button>About the Project</button>
          {state.subchannels.map((subchannel) => (
            <button
              onClick={(_) => {
                updateSelectLesson({ ...lesson });
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
