import "./Home.css";

import { Header } from "../../shared/header/Header";
import Footer from "../../shared/footer/Footer";
import Sidebar from "./sidebar/Sidebar";
import Main from "./main/Main";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { setOpenSidebar } from "../../../redux/features/showcases/showcasesSlice";
import { useEffect } from "react";

//react state management 59:54 unneseaary pairing of useffect and usestate should be avoid
//ded

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const dispatch = useDispatch();
  const isOpenSidebar = useSelector((state) => state.showcases.isOpenSidebar);
  function changeIsOpenSidebar(e) {
    console.log("E", e);
    if (e) {
      document.body.style.overflow = "hidden";
      console.log("HIDDEN");
    } else {
      document.body.style.overflow = "auto";
      console.log("AUTO");
    }
    dispatch(setOpenSidebar(e));
  }

  const selectedShowcase = useSelector(
    (state) => state.showcases.selectedShowcase
  );
  useEffect(() => {
    setSearchParams({ showcase: selectedShowcase.title });
  }, [selectedShowcase]);

  return (
    <div className="home">
      {isOpenSidebar && (
        <div className="sidebarmobile-container">
          <div
            className="sidebarmobile-transition"
            onClick={() => {
              changeIsOpenSidebar(false);
            }}
          />
          <div className="sidebarmobile">
            <div
              className="sidebarmobile-close"
              onClick={() => {
                changeIsOpenSidebar(false);
              }}
            >
              Close
            </div>
            <Sidebar />
          </div>
        </div>
      )}
      <Header showSelect={true} />
      <div className="main-content">
        <div className="main-sidebar">
          <Sidebar />
        </div>
        <div className="main-container">
          <Main />
        </div>
      </div>
      <Footer />
    </div>
  );
}
