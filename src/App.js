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

function App() {
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
        {/* <div className="about"> */}
        <h1>About</h1>
        {/* </div> */}
      </header>
      <main class="container">
        <div class="scroll">
          <div class="box">About</div>
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
      <aside class="sidebar el">
        <h2>Sidebar</h2>
      </aside>
      <footer class="footer el">
        <h2>Footer</h2>
      </footer>
    </div>
  );
}

export default App;
