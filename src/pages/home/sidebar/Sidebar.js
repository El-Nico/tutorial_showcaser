import React from "react";
import "./Sidebar.css";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedSubchannel } from "../../../redux/features/showcases/showcasesSlice";
import { classNames } from "../../../utilities/general";

function Sidebar() {
  const dispatch = useDispatch();
  const subchannels = useSelector((state) => state.showcases.subchannels);

  function changeSubchannel(subchannel) {
    //ideally just this
    dispatch(setSelectedSubchannel(subchannel));
  }
  return (
    <aside id="Sidebar">
      <div className="sidebar-subchannels">
        {subchannels.map((subchannel, i) => (
          <button
            className={classNames(subchannel.selected && "sidebar-active")}
            key={i}
            onClick={(_) => {
              changeSubchannel(subchannel);
            }}
          >
            {subchannel.name}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
