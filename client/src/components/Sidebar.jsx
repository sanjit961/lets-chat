import React, { useState } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import Avatar from "./Avatar";
import { useSelector } from "react-redux";
import EditeUserDetails from "./EditeUserDetails";

function Sidebar() {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(true);

  return (
    <div className="bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between">
      <div>
        <NavLink
          className={(isActive) =>
            `w-12 h-12 cursor-pointer  flex justify-center items-center hover:bg-slate-200 rounded ${
              isActive && "bg-slate-200"
            }`
          }
          title="chat"
        >
          <IoChatbubbleEllipses size={25} />
        </NavLink>
        <div
          className="w-12 h-12 cursor-pointer  flex justify-center items-center hover:bg-slate-200 rounded"
          title="add friend"
        >
          <FaUserPlus size={20} />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <button
          className="mx-auto"
          title={user?.name}
          onClick={() => setEditUserOpen(true)}
        >
          <Avatar
            name={user?.name}
            imageUrl={user?.profile_pic}
            width={38}
            height={38}
          />
        </button>
        <button
          className="w-12 h-12 cursor-pointer  flex justify-center items-center hover:bg-slate-200 rounded"
          title="logout"
        >
          <span className="-ml-2">
            <BiLogOut size={20} />
          </span>
        </button>
      </div>
      {/* Edit User Details */}
      {editUserOpen && (
        <EditeUserDetails onClose={() => setEditUserOpen(false)} user={user} />
      )}
    </div>
  );
}

export default Sidebar;
