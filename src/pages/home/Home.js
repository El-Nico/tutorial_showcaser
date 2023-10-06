import "./Home.css";
import { useState, useEffect, useReducer } from "react";
import { getShowcases } from "../../utilities/firestore-crud";
import { getReadmez } from "../../utilities/github-api";
import MDEditor from "@uiw/react-md-editor";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../../store";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

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
      }
    },
    {
      showcases: [{ title: "example" }],
      selectedShowcase: {
        title: "example",
        previewUrl: "http://example.com/",
      },
      mdSource: "# Example",
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
        console.log("uid", uid);
        r_dispatch(setUser(user));
      } else {
        // User is signed out
        // ...
        console.log("user is logged out");
        r_dispatch(setUser(""));
      }
    });
  }, []);

  //get all showcases
  useEffect(() => {
    getShowcases().then((showcases) => {
      console.log(showcases);
      dispatch({
        type: "SET_SELECTED_AND_ALL_SHOWCASES",
        payload: { showcases: showcases, selectedShowcase: showcases[0] },
      });
    });

    //github stuff
    getReadmez("react_state_management", "/README.md", "El-Nico").then(
      (res) => {
        let source = window.atob(res.data.content);
        console.log(source);
        dispatch({
          type: "SET_MDSOURCE",
          payload: source,
        });
      }
    );
  }, []);

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
        <h3>About</h3>
      </header>
      <main className="container">
        <div className="scroll">
          <div className="box about-box">
            <h1>About</h1>
          </div>
          <div className="box box2">
            <iframe
              src={state.selectedShowcase.previewUrl}
              title={state.selectedShowcase.title}
              width={"100%"}
              height={"100%"}
            ></iframe>
          </div>
          <div className="box box3">
            {/* <MarkdownPreview source={state.mdSource} /> */}
            {/* <MDEditor.Markdown source={state.mdSource} /> */}
            {/* <MDEditor
              height={"100%"}
              value={state.mdSource}
              onChange={(e) => {
                dispatch({
                  type: "SET_MDSOURCE",
                  payload: e,
                });
              }}
            /> */}
            {/* <div className="suc">
              {isLoggedIn}hhh{isLoggedIn}hhh
            </div> */}
            {isLoggedIn && <div className="suc">pussy</div>}
          </div>
        </div>
      </main>
      <aside className="sidebar el">
        {lessons.map((lesson) => (
          <button
            onClick={(_) => {
              updateSelectLesson({ ...lesson });
            }}
          >
            {lesson.lessonName}
          </button>
        ))}
      </aside>

      <footer className="footer el">
        <h2>Footer</h2>
      </footer>
    </div>
  );
}
