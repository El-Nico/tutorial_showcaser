import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/login/Login";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store";
import { About } from "./pages/about/About";
import { Home } from "./pages/home/Home";
import { setLoginState } from "./redux/features/application_state/application_state_slice";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    //track login state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("user is logged in");
        dispatch(setLoginState(true));
      } else {
        console.log("user is logged out");
        dispatch(setLoginState(false));
      }
    });
  }, []);
  return (
    <Router>
      <div>
        <main>
          <Routes>
            {" "}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
