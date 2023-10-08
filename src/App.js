import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/login/Login";
import { Provider } from "react-redux";
import { store } from "./store";
import { About } from "./pages/about/About";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div>
          <section>
            <Routes>
              {" "}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </section>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
