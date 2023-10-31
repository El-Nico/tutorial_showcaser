import React, { useEffect, useLayoutEffect, useRef } from "react";
import "./Main.css";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedMenuButton,
  toggleEditMode,
} from "../../../redux/features/application_state/application_state_slice";
import {
  setReadmeSourceProject,
  setReadmeSourceSubchannel,
} from "../../../redux/features/showcases/showcasesSlice";
import MDEditor from "@uiw/react-md-editor";
import { classNames } from "../../../utilities/general";

function Main() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.applicationState.isLoggedIn);
  const editMode = useSelector((state) => state.applicationState.editMode);
  const projectReadme = useSelector(
    (state) => state.showcases.readmeSourceProject
  );
  const subchannelReadme = useSelector(
    (state) => state.showcases.readmeSourceSubchannel
  );
  const iFrame = useSelector((state) => state.showcases.iFrame);
  const selectedMenuButton = useSelector(
    (state) => state.applicationState.selectedMenuButton
  );

  const scrollDivRef = useRef(null);
  const aboutProjectRef = useRef(null);
  const sectionPreviewRef = useRef(null);
  const aboutSectionRef = useRef(null);

  function updateReadme(source) {
    console.log("do nothing for now");
  }

  function handleScroll(aboutProject, sectionPreview, aboutSection) {
    const aboutProjectOffset = Math.abs(
      aboutProject.getBoundingClientRect().top
    );
    const sectionPreviewOffset = Math.abs(
      sectionPreview.getBoundingClientRect().top
    );
    const aboutSectionOffset = Math.abs(
      aboutSection.getBoundingClientRect().top
    );
    let relOffsets = [
      { elRef: aboutProjectOffset, select: "aboutProject" },
      { elRef: sectionPreviewOffset, select: "sectionPreview" },
      { elRef: aboutSectionOffset, select: "aboutSection" },
    ];
    console.log(relOffsets);
    const pTop = scrollDivRef.current.getBoundingClientRect().top;
    const selectMenuItem = relOffsets.reduce((curr, next, ci) => {
      console.log(curr, next, ci);
      if (!curr.elRef) {
        console.log(curr, ci);
        console.log(next);
        console.log("not ran");
        return { elRef: sectionPreviewOffset, select: "sectionPreview" };
      }
      console.log("i actually got here", curr.elRef);
      const currTop = curr.elRef;
      const nextTop = next.elRef;
      if (Math.abs(nextTop - pTop) < Math.abs(currTop - pTop)) {
        return next;
      } else {
        return curr;
      }
    });
    // console.log(aboutProjectRef.current.getBoundingClientRect());
    // console.log(sectionPreviewRef.current.getBoundingClientRect());
    // console.log(aboutSectionRef.current.getBoundingClientRect());
    console.log(selectMenuItem.select, "yee");
    dispatch(setSelectedMenuButton(selectMenuItem.select));
    // https://stackoverflow.com/questions/635706/how-to-scroll-to-an-element-inside-a-div
  }

  useLayoutEffect(() => {
    mainScrollTo(sectionPreviewRef.current);
  }, []);

  function mainScrollTo(elementRef) {}

  return (
    <main id="Main">
      {/* <button
        onClick={() => {
          boxRef.current.scrollIntoView({ block: "end", behavior: "smooth" });
        }}
      >
        scraa..
      </button> */}
      <div className="main-menu-bar">
        <button
          className={classNames(
            selectedMenuButton === "aboutProject" && "main-active"
          )}
        >
          About this Project
        </button>
        <button
          className={classNames(
            selectedMenuButton === "sectionPreview" && "main-active"
          )}
        >
          Section Preview
        </button>
        <button
          className={classNames(
            selectedMenuButton === "aboutSection" && "main-active"
          )}
        >
          About this Section
        </button>
      </div>
      <div
        className="main-scroll"
        onScroll={(e) => {
          handleScroll(
            aboutProjectRef.current,
            sectionPreviewRef.current,
            aboutSectionRef.current
          );
        }}
        ref={scrollDivRef}
      >
        {/* toggle switch only available when logged in */}
        {isLoggedIn === true && (
          <label className="main-switch">
            <input
              type="checkbox"
              onClick={() => {
                dispatch(toggleEditMode(!editMode));
              }}
            />
            <span className="main-slider main-round"></span>
          </label>
        )}
        <div className="main-box" id="about-box" ref={aboutProjectRef}>
          {/* <MarkdownPreview source={state.mdSource} /> */}
          {!editMode && <MDEditor.Markdown source={projectReadme.markup} />}
          {editMode === true && (
            <>
              <MDEditor
                height={"100%"}
                value={projectReadme.markup}
                onChange={(e) => {
                  dispatch(
                    setReadmeSourceProject({ ...projectReadme, markup: e })
                  );
                }}
              />
              <button
                onClick={() => {
                  //aight i stopped here
                  updateReadme();
                }}
              >
                done
              </button>
            </>
          )}
        </div>
        <hr />
        <div className="main-box main-box2" ref={sectionPreviewRef}>
          <iframe
            src={iFrame.url}
            title={iFrame.title}
            width={"100%"}
            height={"100%"}
          ></iframe>
        </div>
        <hr />
        <div className="main-box main-box3" ref={aboutSectionRef}>
          {/* <MarkdownPreview source={state.mdSource} /> */}
          {!editMode && <MDEditor.Markdown source={subchannelReadme.markup} />}
          {editMode === true && (
            <>
              <MDEditor
                height={"100%"}
                value={subchannelReadme.markup}
                onChange={(e) => {
                  dispatch(
                    setReadmeSourceSubchannel({
                      ...subchannelReadme,
                      markup: e,
                    })
                  );
                }}
              />
              <button
                onClick={() => {
                  updateReadme();
                }}
              >
                done
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Main;
