import "./Home.css";

import { Header } from "./shared/header/Header";
import Footer from "./shared/footer/Footer";
import Sidebar from "./sidebar/Sidebar";
import Main from "./main/Main";

//react state management 59:54 unneseaary pairing of useffect and usestate should be avoid
//ded

export function Home() {
  // console.log(res);
  ///////////////testhere////////////////
  // const content = window.btoa("new stuffs4");
  // const sha = res.data.sha;
  // create_update_file(
  //   OWNER,
  //   "css_tutorials",
  //   "README.MD",
  //   "testing programmatic commit4",
  //   { name: "Nicholas Eruba", email: "nicholasc1665@yahoo.com" },
  //   content,
  //   sha
  // ).then((res) => {
  //   console.log(res);
  // });

  //css_tutorials/01_lesson/README.md
  //css_tutorials/02_lesson/readme.md
  //css_tutorials/03_lesson_css_colors/lesson.md

  return (
    <div className="home">
      <Header showSelect={true} />
      <Main />
      <Sidebar />
      <Footer />
    </div>
  );
}
