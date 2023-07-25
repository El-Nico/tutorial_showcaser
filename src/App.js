import "./App.css";
import { useState, useEffect } from "react";
import { storage } from "./firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { tutorials } from "./utilities/keys";
import { testa } from "./utilities/jszipcode";
import {
  URLtoFile,
  downloadFile,
  getgit,
  getgit2,
} from "./utilities/filewrangler";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getCourses } from "./utilities/firestore-crud";
import { getLessons } from "./utilities/firestore-crud";

function App() {
  const [courses, updateCourses] = useState([]);
  const [defaultSelectCourse, updateDefaultSelectCourse] =
    useState("css_tutorials");
  const [selectOptions, updateSelectOptions] = useState([
    { label: "course 01", value: "placeholder" },
  ]);
  const [lessons, updateLessons] = useState([]);
  const [selectLesson, updateSelectLesson] = useState({});

  //get courses
  useEffect(() => {
    getCourses()
      ///update courses state
      .then((coursesData) => {
        updateCourses([...coursesData]);
        return coursesData;
      });
  }, []);

  //render courses select options
  useEffect(() => {
    const selectOptions = courses.map((course) => {
      if (course.default) updateDefaultSelectCourse(course.title);

      return {
        label: course.title,
        value: course.title,
        id: course.id,
        previewCollectionId: course.preview_channels,
      };
    });
    updateSelectOptions([...selectOptions]);
  }, [courses]);

  // make api call to firebase for render courses lessons
  useEffect(() => {
    async function fetchLessonData() {
      console.log(courses, defaultSelectCourse);

      const lessonData = await getLessons(defaultSelectCourse, courses);
      if (lessonData) {
        //const mappedLessonData = lessonData.data.map((lesson) => lesson.name);
        updateLessons(lessonData);
      }
    }
    fetchLessonData();
    console.log(lessons);
  }, [defaultSelectCourse]);

  //make api call for course ifram
  return (
    <div className="App">
      <header className="header el">
        <div className="custom-select">
          <select
            value={defaultSelectCourse}
            onChange={(e) => updateDefaultSelectCourse(e.target.value)}
          >
            {selectOptions.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
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
              src={selectLesson.channel_url}
              title={selectLesson.lessonName}
              width={"100%"}
              height={"100%"}
            ></iframe>
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

export default App;
