import "./App.css";
import { useState, useEffect, useReducer } from "react";
import { getCourses, getShowcases } from "./utilities/firestore-crud";
import { getLessons } from "./utilities/firestore-crud";

//react state management 59:54 unneseaary pairing of useffect and usestate should be avoid
//ded

function App() {
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
      }
    },
    {
      showcases: [{ title: "example" }],
      selectedShowcase: {
        title: "example",
        previewUrl: "http://example.com/",
      },
    }
  );

  //get all showcases
  useEffect(() => {
    getShowcases().then((showcases) => {
      console.log(showcases);
      dispatch({
        type: "SET_SELECTED_AND_ALL_SHOWCASES",
        payload: { showcases: showcases, selectedShowcase: showcases[0] },
      });
    });
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
              console.log("ran");
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
          <div className="box box3">About this section</div>
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

export default App;
// https://codesandbox.io/embed/markdown-editor-for-react-izdd6?fontsize=14&hidenavigation=1&theme=dark
//  https://codesandbox.io/embed/react-markdown-preview-co1mj?fontsize=14&hidenavigation=1&theme=dark
