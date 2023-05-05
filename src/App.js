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
  ////////////////////////zip stuff//////////
  // testa();
  //downloadFile(tutorials.css, "xy.zip");
  // getgit("El-Nico", "css_tutorials", "README.md").then((data) => {
  //   console.log("data shortly");
  //   console.log(data);
  // });
  // const navigate = useNavigate();

  // window.location.assign(
  //   "https://github.com/El-Nico/css_tutorials/archive/refs/heads/main.zip"
  // );

  getgit2("El-Nico", "fewd_lab_3", "01_lesson").then((data) => {
    console.log(data);
  });
  //////////////////end of zip stuff//////////////
  const [imageUpload, setImageUpload] = useState(null);
  const [imageList, setImageList] = useState([]);

  const imageListRef = ref(storage, "images/");
  const uploadImage = () => {
    if (imageUpload == null) return;
    // const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
    // uploadBytes(imageRef, imageUpload).then((snapshot) => {
    //   alert("Image uploaded");
    //   getDownloadURL(snapshot.ref).then((url) => {
    //     setImageList((prev) => [...prev, url]);
    //   });
    // });
    /////////////////////ma own jargon//////////////////////////////

    const myFile = URLtoFile(
      "https://i.insider.com/602d763842b84000192f4072?width=1136&format=jpeg"
    ).then((myfile) => {
      const imageRef = ref(storage, `images/${v4() + myfile.name}`);
      uploadBytes(imageRef, myfile).then((snapshot) => {
        console.log("deep then");
        console.log(myfile);
        alert("Image uploaded");
        getDownloadURL(snapshot.ref).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
    }); ///luh umma beast

    /////////////////////end of ma own jargon/////////////////
  };

  useEffect(() => {
    listAll(imageListRef).then((response) => {
      console.log(response);
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  return (
    <div className="App">
      <input
        type="file"
        onChange={(event) => {
          setImageUpload(event.target.files[0]);
        }}
      />
      <button onClick={uploadImage}>Upload Image</button>
      {imageList.map((url) => {
        return <img src={url}></img>;
      })}
      {/* <header class="header el">
        <h1>Header</h1>
      </header>
      <main class="container">
        <div class="box">1</div>
        <div class="box">2</div>
        <div class="box">3</div>
        <div class="box">4</div>
        <div class="box">5</div>
        <div class="box">6</div>
      </main>
      <aside class="sidebar el">
        <h2>Sidebar</h2>
      </aside>
      <footer class="footer el">
        <h2>Footer</h2>
      </footer> */}
    </div>
  );
}

export default App;
