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
  setSelectedSubchannel,
} from "../../../redux/features/showcases/showcasesSlice";
import MDEditor from "@uiw/react-md-editor";
import { classNames, generateUID } from "../../../utilities/general";
import { BsChevronRight, BsChevronLeft } from "react-icons/bs";
import {
  COMMITTER,
  OWNER,
  create_update_file,
} from "../../../utilities/github-api";

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

  const subchannels = useSelector((state) => state.showcases.subchannels);
  const selectedSubchannel = useSelector(
    (state) => state.showcases.selectedSubchannel
  );

  const scrollDivRef = useRef(null);
  const aboutProjectRef = useRef(null);
  const sectionPreviewRef = useRef(null);
  const aboutSectionRef = useRef(null);

  function updateReadme(whichReadme, sub) {
    const source = whichReadme.markup;
    const content = window.btoa(source);
    const sha = whichReadme.sha;
    const commitMessage =
      `update Readme for ${
        sub ? "section " + whichReadme.path.split("/")[0] + " " : "project "
      } ` + generateUID();

    console.log(commitMessage);

    const path = whichReadme.path;
    const repo = whichReadme.repo;
    create_update_file(
      OWNER,
      repo,
      path,
      commitMessage,
      COMMITTER,
      content,
      sha
    ).then((res) => {
      console.log(res);
      const readmeSource = {
        repo: repo,
        markup: source,
        sha: res.data.content.sha,
        path: res.data.content.path,
      };
      if (sub) {
        dispatch(setReadmeSourceSubchannel(readmeSource));
        return;
      }
      dispatch(setReadmeSourceProject(readmeSource));
    });
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

    const pTop = scrollDivRef.current.getBoundingClientRect().top;
    const selectMenuItem = relOffsets.reduce((curr, next, ci) => {
      if (!curr.elRef) {
        console.log(curr, ci);
        console.log(next);
        console.log("not ran");
        return { elRef: sectionPreviewOffset, select: "sectionPreview" };
      }
      const currTop = curr.elRef;
      const nextTop = next.elRef;
      if (Math.abs(nextTop - pTop) < Math.abs(currTop - pTop)) {
        return next;
      } else {
        return curr;
      }
    });
    dispatch(setSelectedMenuButton(selectMenuItem.select));
    // https://stackoverflow.com/questions/635706/how-to-scroll-to-an-element-inside-a-div
    console.table([
      { title: "onscroll" },
      {
        name: "aboutProject",
        top: aboutProjectRef.current.getBoundingClientRect().top,
        relOffset: aboutProjectRef.current.getBoundingClientRect().top - pTop,
      },
      {
        name: "sectionPreview",
        top: sectionPreviewRef.current.getBoundingClientRect().top,
        relOffset: sectionPreviewRef.current.getBoundingClientRect().top - pTop,
      },
      {
        name: "aboutSection",
        top: aboutSectionRef.current.getBoundingClientRect().top,
        relOffset: aboutSectionRef.current.getBoundingClientRect().top - pTop,
      },
      {
        name: "scrollDiv",
        top: pTop,
        relOffset: scrollDivRef.current.getBoundingClientRect().top - pTop,
      },
    ]);
  }
  console.log("weve got a rerender");
  useLayoutEffect(() => {
    console.log("runnign");
    // mainScrollTo(sectionPreviewRef);
  }, []);

  function mainScrollTo(elementRef, menuState) {
    const pTop = scrollDivRef.current.getBoundingClientRect().top;
    const elTop = elementRef.current.getBoundingClientRect().top;
    const relOffset = elTop - pTop;

    // console.log(elTop, pTop, relOffset);
    // console.table([
    //   { title: "before" },
    //   {
    //     name: "aboutProject",
    //     top: aboutProjectRef.current.getBoundingClientRect().top,
    //     relOffset: aboutProjectRef.current.getBoundingClientRect().top - pTop,
    //   },
    //   {
    //     name: "sectionPreview",
    //     top: sectionPreviewRef.current.getBoundingClientRect().top,
    //     relOffset: sectionPreviewRef.current.getBoundingClientRect().top - pTop,
    //   },
    //   {
    //     name: "aboutSection",
    //     top: aboutSectionRef.current.getBoundingClientRect().top,
    //     relOffset: aboutSectionRef.current.getBoundingClientRect().top - pTop,
    //   },
    //   {
    //     name: "scrollDiv",
    //     top: pTop,
    //     relOffset: scrollDivRef.current.getBoundingClientRect().top - pTop,
    //   },
    // ]);
    scrollDivRef.current.scrollTo({ top: relOffset, behavior: "smooth" });
    // console.log(elTop, pTop, relOffset);
    console.table([
      { title: "after" },
      {
        name: "aboutProject",
        top: aboutProjectRef.current.getBoundingClientRect().top,
        relOffset: aboutProjectRef.current.getBoundingClientRect().top - pTop,
      },
      {
        name: "sectionPreview",
        top: sectionPreviewRef.current.getBoundingClientRect().top,
        relOffset: sectionPreviewRef.current.getBoundingClientRect().top - pTop,
      },
      {
        name: "aboutSection",
        top: aboutSectionRef.current.getBoundingClientRect().top,
        relOffset: aboutSectionRef.current.getBoundingClientRect().top - pTop,
      },
      {
        name: "scrollDiv",
        top: pTop,
        relOffset: scrollDivRef.current.getBoundingClientRect().top - pTop,
      },
    ]);
    // dispatch(setSelectedMenuButton(menuState));
  }

  return (
    <main id="Main">
      <div className="main-menu-bar">
        <button
          onClick={() => {
            const i = subchannels.findIndex(
              (sub) => sub.name === selectedSubchannel.name
            );
            if (i > 0) {
              dispatch(setSelectedSubchannel(subchannels[i - 1]));
            }
          }}
          className="chevron-button"
        >
          <BsChevronLeft></BsChevronLeft>
        </button>
        <button
          onClick={() => {
            mainScrollTo(aboutProjectRef, "aboutProject");
          }}
          className={classNames(
            selectedMenuButton === "aboutProject" && "main-active"
          )}
        >
          About this Project
        </button>
        <button
          onClick={() => {
            mainScrollTo(sectionPreviewRef, "sectionPreview");
          }}
          className={classNames(
            selectedMenuButton === "sectionPreview" && "main-active"
          )}
        >
          Section Preview
        </button>
        <button
          onClick={() => {
            mainScrollTo(aboutSectionRef, "aboutSection");
          }}
          className={classNames(
            selectedMenuButton === "aboutSection" && "main-active"
          )}
        >
          About this Section
        </button>
        <button
          onClick={() => {
            // const subchannels = useSelector(
            //   (state) => state.showcases.subchannels
            // );
            // const selectedSubchannel = useSelector(
            //   (state) => state.showcases.selectedSubchannel
            // );
            const i = subchannels.findIndex(
              (sub) => sub.name === selectedSubchannel.name
            );
            if (i < subchannels.length - 1) {
              dispatch(setSelectedSubchannel(subchannels[i + 1]));
            }
          }}
          className="chevron-button"
        >
          <BsChevronRight></BsChevronRight>
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
                  updateReadme(projectReadme, false);
                }}
              >
                Update Project Readme
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
                  updateReadme(subchannelReadme, true);
                }}
              >
                Update Section Readme
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Main;
