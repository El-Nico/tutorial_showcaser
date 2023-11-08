import "./Home.css";

import { Header } from "../../shared/header/Header";
import Footer from "../../shared/footer/Footer";
import Sidebar from "./sidebar/Sidebar";
import Main from "./main/Main";

//react state management 59:54 unneseaary pairing of useffect and usestate should be avoid
//ded

export function Home() {
  return (
    <div className="home">
      <Header showSelect={true} />
      <Main />
      <Sidebar />
      <Footer />
    </div>
  );
}
