import "./Header.css";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar, setSelectedShowcase } from "../../../redux/features/showcases/showcasesSlice";
import { useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { classNames } from "../../../utilities/general";
// https://react-icons.github.io/react-icons/search?q=hamburger

export function Header(props) {
  const dispatch = useDispatch();
  const showcases = useSelector((state) => state.showcases.showcases);
  const selectedShowcase = useSelector(
    (state) => state.showcases.selectedShowcase
  );

  function changeIsOpenSidebar(e) {
    console.log("E", e);
    if (e) {
      document.body.style.overflow = 'hidden';
      console.log("HIDDEN");
    } else {
      document.body.style.overflow = 'auto';
      console.log("AUTO");
    }
    dispatch(setOpenSidebar(e));
  }

  function changeSelectedShowcase(e) {
    const selectedShowcase = showcases.find(
      (showcase) => showcase?.title === e.target.value
    );
    dispatch(setSelectedShowcase(selectedShowcase));
  }

  const navigate = useNavigate();
  return (
    <header id="header">
      <div 
          className={classNames(
            !props.showSelect ? "header-element-container-left header-element-container" : "header-element-container"
      )}>
        {props.showSelect && (
        <div className="header-hamburger-menu-button" onClick={() => {
            changeIsOpenSidebar(true);
          }}>
          <GiHamburgerMenu></GiHamburgerMenu>
        </div>
        )}
        {props.showSelect && (
          <div className="header-custom-select">
            <select
              value={selectedShowcase?.title}
              onChange={(e) => {
                changeSelectedShowcase(e);
              }}
            >
              {showcases.map((showcase) => (
                <option key={showcase?.title} value={showcase?.title}>
                  {showcase?.title}
                </option>
              ))}
            </select>
            <span className="header-custom-arrow"></span>
          </div>
        )}
        <div
          className={classNames(
            !props.showSelect ? "header-nav-logo margin-off" : "header-nav-logo")}
          onClick={() => {
            navigate("/home");
          }}
        >
          <h2>Project Showcaser</h2>
        </div>
        <div
          className="header-nav-about"
          onClick={() => {
            navigate("/about");
          }}
        >
          <h3>About</h3>
        </div>
      </div>
      <div className="header-select">
        <div className="header-custom-select-mobile">
          <select
            value={selectedShowcase?.title}
            onChange={(e) => {
              changeSelectedShowcase(e);
            }}
          >
            {showcases.map((showcase) => (
              <option key={showcase?.title} value={showcase?.title}>
                {showcase?.title}
              </option>
            ))}
          </select>
          <span className="header-custom-arrow"></span>
        </div>
      </div>
    </header>
    
  );
}
