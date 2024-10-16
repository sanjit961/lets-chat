import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import { HiDotsVertical } from "react-icons/hi";
import { IoMdSend } from "react-icons/io";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { uploadFile } from "../helpers/uploadFile";
import Loader from "./Loader";
import backgroundImage from "../assets/wallapaper.jpeg";
import moment from "moment";

function MessagePage() {
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const currentMessage = useRef(null);
  const params = useParams();

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [allMessages]);

  const socketConnection = useSelector(
    (state) => state?.user?.socketConnection
  );
  const user = useSelector((state) => state?.user);

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("message-page", params.userId);

      socketConnection.on("message-user", (data) => {
        setDataUser(data);
      });

      socketConnection.on("message", (data) => {
        console.log("message data", data);
        setAllMessages(data);
      });
    }
  }, [socketConnection, params?.userId, user]);

  const handleOpenImageVideoUpload = () => {
    setOpenImageVideoUpload(true);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadPhoto = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage((prev) => {
      return {
        ...prev,
        imageUrl: uploadPhoto.url,
      };
    });
  };
  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    const uploadVideo = await uploadFile(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage((prev) => {
      return {
        ...prev,
        videoUrl: uploadVideo.url,
      };
    });
  };

  const handleClearUploadImage = () => {
    setMessage((prev) => {
      return {
        ...prev,
        imageUrl: "",
      };
    });
  };
  const handleClearUploadVideo = () => {
    setMessage((prev) => {
      return {
        ...prev,
        videoUrl: "",
      };
    });
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setMessage((prev) => {
      return {
        ...prev,
        text: value,
      };
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.videoUrl || message.imageUrl) {
      if (socketConnection) {
        socketConnection.emit("new-message", {
          sender: user?._id,
          reciever: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id,
        });
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
        });
      }
    }
  };
  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className="bg-no-repeat bg-cover"
    >
      <header className="sticky top-0 h-16 bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to={"/"} className="lg:hidden">
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              name={dataUser?.name}
              imageUrl={dataUser?.profile_pic}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg my-0 ">{dataUser?.name}</h3>
            <p className="-my-2 text-sm">
              {dataUser?.online ? (
                <span className="text-primary">online</span>
              ) : (
                <span className="text-slate-400">offline</span>
              )}
            </p>
          </div>
        </div>
        <div>
          <button className="cursor-pointer hover:text-primary">
            <HiDotsVertical />
          </button>
        </div>
      </header>
      {/* Show all messages */}

      <section className="h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50">
        {/* Show all messages */}

        <div className="flex flex-col gap-2 py-2 mx-2" ref={currentMessage}>
          {allMessages?.map((msg, index) => {
            return (
              <div
                key={index} // Added key prop
                className={`bg-white p-1 py-1 rounded w-fit ${
                  user._id === msg.msgByUserId
                    ? "ml-auto bg-teal-100"
                    : "bg-gray-100"
                }`}
              >
                {msg?.imageUrl && (
                  <div className="w-full mb-1">
                    <img
                      src={msg?.imageUrl}
                      alt="attached"
                      className="max-w-xs max-h-64 object-scale-down rounded"
                    />
                  </div>
                )}
                {msg?.videoUrl && (
                  <div className="w-full mb-1">
                    <video
                      src={msg?.videoUrl}
                      controls
                      muted
                      className="max-w-xs max-h-64 object-scale-down rounded"
                    />
                  </div>
                )}

                <p className="px-2 break-words max-w-xs">{msg?.text}</p>

                <p className="text-xs text-gray-500 px-2 mt-1 text-right">
                  {moment(msg.createdAt).format("hh:mm A")}
                </p>
              </div>
            );
          })}
        </div>
        {/* Upload Image display */}
        {message.imageUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center rounded overflow-hidden">
            <div
              onClick={handleClearUploadImage}
              className="w-fit absolute top-0 right-0 cursor-pointer hover:text-red-600"
            >
              <IoClose size={30} />
            </div>
            <div className="bg-white p-3">
              <img
                src={message?.imageUrl}
                alt="uploadImage"
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}
        {/* Upload video display */}
        {message.videoUrl && (
          <div className="w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center rounded overflow-hidden">
            <div
              onClick={handleClearUploadVideo}
              className="w-fit absolute top-0 right-0 cursor-pointer hover:text-red-600"
            >
              <IoClose size={30} />
            </div>
            <div className="bg-white p-3">
              <video
                src={message?.videoUrl}
                controls
                muted
                autoPlay
                className="aspect-square w-full h-full max-w-sm m-2 object-scale-down"
              />
            </div>
          </div>
        )}
        {loading && (
          <div className="w-full h-full sticky bottom-0 flex justify-center items-center">
            <Loader />
          </div>
        )}
      </section>

      {/* Send Message */}
      <section className="h-16 bg-white flex items-center p-4">
        <div className="relative">
          <button
            onClick={() => handleOpenImageVideoUpload()}
            className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white"
          >
            <FaPlus size={20} />
          </button>

          {/* Video and Image */}

          {openImageVideoUpload && (
            <div className="bg-white shadow rounded absolute bottom-12 w-36 p-2">
              <form>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 gap-3 hover:bg-slate-200 px-3 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label
                  htmlFor="uploadVideo"
                  className="flex items-center p-2 gap-3 hover:bg-slate-200 px-3 cursor-pointer"
                >
                  <div className="text-purple-500">
                    <FaVideo size={18} />
                  </div>
                  <p>Video</p>
                </label>
                <input
                  type="file"
                  id="uploadImage"
                  className="hidden"
                  onChange={handleUploadImage}
                />
                <input
                  type="file"
                  id="uploadVideo"
                  className="hidden"
                  onChange={handleUploadVideo}
                />
              </form>
            </div>
          )}
        </div>
        {/* input box */}
        <form className="h-full w-full flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            name="text"
            placeholder="Type here message..."
            className="py-1 px-4 outline-none w-full h-full"
            value={message.text}
            onChange={handleOnChange}
          />
          <button>
            <IoMdSend size={28} className="text-primary hover:text-secondary" />
          </button>
        </form>
      </section>
    </div>
  );
}

export default MessagePage;
