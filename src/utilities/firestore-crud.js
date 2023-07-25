import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

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
const coursesCollectionRef = collection(db, "courses");

//// get courses
export const getCourses = async () => {
  let courses = [];
  const data = await getDocs(coursesCollectionRef);
  courses = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return courses;
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
