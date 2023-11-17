import React, { useLayoutEffect, useRef } from "react";
import "./Main.css";
import { useDispatch, useSelector } from "react-redux";
import {
  mainScrollTriggered,
  setSelectedMenuButton,
  toggleEditMode,
} from "../../../../redux/features/application_state/application_state_slice";
import {
  setReadmeSourceProject,
  setReadmeSourceSubchannel,
  setSelectedSubchannel,
} from "../../../../redux/features/showcases/showcasesSlice";
import MDEditor from "@uiw/react-md-editor";
import { classNames, generateUID } from "../../../../utilities/general";
import { BsChevronRight, BsChevronLeft } from "react-icons/bs";
import {
  COMMITTER,
  OWNER,
  create_update_file,
} from "../../../../utilities/github-api";

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
  const shouldTriggerMainScroll = useSelector(
    (state) => state.applicationState.triggerMainScroll
  );

  const scrollDivRef = useRef(null);
  const aboutProjectRef = useRef(null);
  const sectionPreviewRef = useRef(null);
  const aboutSectionRef = useRef(null);

  useLayoutEffect(() => {
    if (shouldTriggerMainScroll) {
      mainScrollTo("sectionPreview");
      dispatch(mainScrollTriggered(false));
    }
  });

  function updateReadme(whichReadme, sub) {
    const source = whichReadme.markup;
    const content = window.btoa(source);
    const sha = whichReadme.sha;
    const commitMessage =
      `update Readme for ${
        sub ? "section " + whichReadme.path.split("/")[0] + " " : "project "
      } ` + generateUID();

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

  function handleScroll() {
    const parent = scrollDivRef.current.getBoundingClientRect().top;
    const aboutRef = aboutProjectRef.current.getBoundingClientRect().top;
    const sectionRef = sectionPreviewRef.current.getBoundingClientRect().top;
    const aboutSecRef = aboutSectionRef.current.getBoundingClientRect().top;
    const send = {
      parent,
      children: [
        { top: aboutRef, key: "aboutProject" },
        { top: sectionRef, key: "sectionPreview" },
        { top: aboutSecRef, key: "aboutSection" },
      ],
    };
    return dispatch(setSelectedMenuButton(send));
  }
  function mainScrollTo(section) {
    const relOffset = selectedMenuButton.offsetMap[section];
    scrollDivRef.current.scrollBy({ top: relOffset, behavior: "smooth" });
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
          className="chevron-button left"
        >
          <BsChevronLeft></BsChevronLeft>
        </button>
        <button
          onClick={() => {
            mainScrollTo("aboutProject");
          }}
          className={classNames(
            selectedMenuButton.section === "aboutProject" && "main-active"
          )}
        >
          About this Project
        </button>
        <button
          onClick={() => {
            mainScrollTo("sectionPreview");
          }}
          className={classNames(
            selectedMenuButton.section === "sectionPreview" && "main-active"
          )}
        >
          Section Preview
        </button>
        <button
          onClick={() => {
            mainScrollTo("aboutSection");
          }}
          className={classNames(
            selectedMenuButton.section === "aboutSection" && "main-active"
          )}
        >
          About this Section
        </button>
        <button
          onClick={() => {
            const i = subchannels.findIndex(
              (sub) => sub.name === selectedSubchannel.name
            );
            if (i < subchannels.length - 1) {
              dispatch(setSelectedSubchannel(subchannels[i + 1]));
            }
          }}
          className="chevron-button right"
        >
          <BsChevronRight></BsChevronRight>
        </button>
      </div>
      <div
        className="main-scroll"
        onScroll={(e) => {
          handleScroll();
        }}
        ref={scrollDivRef}
      >
        {/* toggle switch only available when logged in */}
        {/* {isLoggedIn === true && ( */}
        {/* <div className="main-edit-switch">
          Edit */}
        <label 
          className={classNames(
            !editMode ? "main-switch tooltip" : "main-switch active tooltip")}
          >
          <span className="tooltiptext">{editMode ? 'Off Readme' : 'Edit Readme'}</span>
          <input
            type="checkbox"
            onClick={() => {
              dispatch(toggleEditMode(!editMode));
            }}
          />
          <span className="main-slider main-round"></span>
        </label>
        {/* </div> */}

        {/* )} */}
        <div className="main-box" id="about-box" ref={aboutProjectRef}>
          {/* <MarkdownPreview source={state.mdSource} /> */}
          {!editMode && <MDEditor.Markdown source={projectReadme.markup} />}
          {editMode === true && (
            <>
              <MDEditor
                className="main-markdown-editor"
                height={"80vh"}
                value={projectReadme.markup}
                onChange={(e) => {
                  dispatch(
                    setReadmeSourceProject({ ...projectReadme, markup: e })
                  );
                }}
              />
              <button
                className="main-update-readme"
                onClick={() => {
                  if (!isLoggedIn) {
                    alert("Not Authorized");
                    return;
                  }
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
            title={iFrame?.title}
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
                className="main-markdown-editor"
                height={"80vh"}
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
                className="main-update-readme"
                onClick={() => {
                  if (!isLoggedIn) {
                    alert("Not Authorized");
                    return;
                  }
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
