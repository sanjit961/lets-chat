import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { PiUserCircle } from "react-icons/pi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { uploadFile } from "../helpers/uploadFile.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar.jsx";

function CheckPasswordPage() {
  const [data, setData] = useState({
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  console.log(location.state);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <div className="mt-5">
      <div className="bg-white w-full max-w-sm mx-2 rounded overflow-hidden p-4 mx-auto">
        <div className="w-fit mx-auto mb-2">
          {/* <PiUserCircle size={80} /> */}
          <Avatar width={70} name={"sanjit"} height={70}/>
        </div>
        <h3>Welcome to Chat App!</h3>
        <form className="grid gap-4 mt-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="password">password: </label>
            <input
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              type="password"
              value={data.password}
              onChange={handleOnChange}
              required
              id="password"
              name="password"
              placeholder="enter your password"
            />
          </div>

          <button className="bg-primary text-lg font-bold px-4 py-1 hover:bg-secondary rounded mt-2 text-white leading-relaxed tracking-wide">
            Let's Go
          </button>
        </form>
        <p className="my-3 text-center">
          New User ?{" "}
          <Link to={"/register"} className="hover:text-primary font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default CheckPasswordPage;
