import React, { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { uploadFile } from "../helpers/uploadFile";

function EditeUserDetails({ onClose, user }) {
  const [data, setData] = useState({
    name: user?.name,
    profile_pic: user?.profile_pic,
  });

  useEffect(() => {
    setData((prev) => {
      return {
        ...prev,
        ...user,
      };
    });
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];

    const uploadMyFile = await uploadFile(file);

    setData((prev) => {
      return {
        ...prev,
        profile_pic: uploadMyFile?.url,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-5 m-1 rounded w-full max-w-sm">
        <h2 className="font-semibold">Profile Details</h2>
        <p className="text-sm"> Edit user details</p>
        <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              id="name"
              value={data?.name}
              onChange={handleOnChange}
              className="w-full py-1 px-2 focus:outline-primary border-0.5"
            />
          </div>

          <div>
            <label htmlFor="profile_pic">Photo</label>
            <div className="my-1 flex items-center gap-4">
              <Avatar
                width={40}
                height={40}
                imageUrl={data?.profile_pic}
                name={data?.name}
              />
              <button className="font-semibold">change Photo</button>
              <input
                type="file"
                className="hidden"
                onChange={handleUploadPhoto}
              />
            </div>
          </div>
          <div className="flex gap-2 w-fit ml-auto mt-3">
            <button className="border-primary border px-4 text-primary py-1 rounded">
              Cancel
            </button>
            <button className="border-primary bg-primary border px-4 py-1 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default React.memo(EditeUserDetails);
