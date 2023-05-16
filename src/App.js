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

function App() {
  // const [courses, updateCourses] = useState([]);
  // useEffect(() => {
  //   getCourses().then((coursesData) => {
  //     updateCourses([...courses, coursesData]);
  //   });
  // }, [courses]);

  ////////////////////////////////////testing db//////////////////////////////////
  //create states
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(0);
  //end of create states
  const [users, setUsers] = useState([]);
  const usersCollectionRef = collection(db, "users");
  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getUsers();
  }, []);

  const updateUser = async (id, age) => {
    const userDoc = doc(db, "users", id);
    const newFields = { age: age + 1 };
    await updateDoc(userDoc, newFields);
  };

  const createUser = async () => {
    await addDoc(usersCollectionRef, { name: newName, age: Number(newAge) });
  };

  const deleteUser = async (id) => {
    const userDoc = doc(db, "users", id);
    await deleteDoc(userDoc);
  };
  //////////////////////////////nd of testing db////////////////////////////////////////
  return (
    <div className="App">
      <header class="header el">
        <div className="custom-select">
          <select>
            <option value="">React Course</option>
            <option value="">CSS Tutorials</option>
          </select>
          <span className="custom-arrow"></span>
        </div>
        <h1 class="logo">tutorial showcaser</h1>
      </header>
      <main class="container">
        <div class="scroll">
          <div class="box about-box">
            <input
              type="text"
              placeholder="Name..."
              onChange={(e) => {
                setNewName(e.target.value);
              }}
            />
            <input
              type="number"
              placeholder="Age..."
              onChange={(e) => {
                setNewAge(e.target.value);
              }}
            />
            <button onClick={createUser}>Create User</button>
            {users.map((user) => {
              return (
                <div>
                  {" "}
                  <h1>Name: {user.name}</h1>
                  <h1>Age: {user.age}</h1>
                  <button
                    onClick={() => {
                      updateUser(user.id, user.age);
                    }}
                  >
                    Increase Age
                  </button>
                  <button
                    onClick={() => {
                      deleteUser(user.id);
                    }}
                  >
                    Delete User
                  </button>
                </div>
              );
            })}
          </div>
          <div class="box box2">
            <iframe
              src="https://www.nicholas-eruba.com"
              title="W3Schools Free Online Web Tutorials"
              width={"100%"}
              height={"100%"}
            ></iframe>
          </div>
        </div>
      </main>
      <aside class="sidebar el">{/* {courseList} */}</aside>

      <footer class="footer el">
        <h2>Footer</h2>
      </footer>
    </div>
  );
}

export default App;
