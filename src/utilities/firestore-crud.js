import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { OWNER, getRepoContents } from "./github-api";

////////////////////////////////////testing db//////////////////////////////////
//create states
//   const [newName, setNewName] = useState("");
//   const [newAge, setNewAge] = useState(0);
//   //end of create states
//   const [users, setUsers] = useState([]);
//   const usersCollectionRef = collection(db, "users");
//   useEffect(() => {
//     const getUsers = async () => {
//       const data = await getDocs(usersCollectionRef);
//       setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
//     };
//     getUsers();
//   }, []);

//collection references
const showcasesCollectionRef = collection(db, "showcases");

const getData = async (ref) => {
  let docData = [];
  const data = await getDocs(ref);
  docData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return docData;
};

/// get showcases
export const getShowcases = async () => {
  let showcases = [];
  const data = await getDocs(showcasesCollectionRef);
  showcases = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return showcases;
};

//// get Lessons with coursename
export const getLessons = async (courseName, courses) => {
  const previewCollectionId = await courses.find(
    (course) => course.title === courseName
  ).preview_channels;
  const lessonsCollectionRef = collection(db, previewCollectionId);
  let lessons = [];
  const data = await getDocs(lessonsCollectionRef);
  lessons = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return lessons;
};

////dont really need all these now
// //// update courses
// const updateCourses = async (id, age) => {
//   const userDoc = doc(db, "users", id);
//   const newFields = { age: age + 1 };
//   await updateDoc(userDoc, newFields);
// };

// const createUser = async () => {
//   await addDoc(usersCollectionRef, { name: newName, age: Number(newAge) });
// };

// const deleteUser = async (id) => {
//   const userDoc = doc(db, "users", id);
//   await deleteDoc(userDoc);
// };
//////////////////////////////nd of testing db////////////////////////////////////////
