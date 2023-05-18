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
import { getCourses } from "./utilities/firestoreCRUD";

function App() {
  const [courses, updateCourses] = useState([]);
  const [defaultCourse, updateDefaultCourse] = useState("");
  const [selectOptions, updateSelectOptions] = useState([
    { label: "course 01", value: "placeholder" },
  ]);

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
      if (course.default) updateDefaultCourse(course.title);

      return { label: course.title, value: course.title, id: course.id };
    });
    updateSelectOptions([...selectOptions]);
  }, [courses]);

  // make api call to github for render courses lessons
  useEffect(() => {}, [defaultCourse]);

  //make api call for course ifram
  return (
    <div className="App">
      <header className="header el">
        <div className="custom-select">
          <select
            value={defaultCourse}
            onChange={(e) => updateDefaultCourse(e.target.value)}
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
              src="https://www.nicholas-eruba.com"
              title="W3Schools Free Online Web Tutorials"
              width={"100%"}
              height={"100%"}
            ></iframe>
          </div>
        </div>
      </main>
      <aside className="sidebar el">{/* {courseList} */}</aside>

      <footer className="footer el">
        <h2>Footer</h2>
      </footer>
    </div>
  );
}

export default App;
