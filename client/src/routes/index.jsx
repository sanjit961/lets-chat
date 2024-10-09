import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import RegisterPage from "../pages/RegisterPage";
import CheckPasswordPage from "../pages/CheckPasswordPage";
import CheckEmailPage from "../pages/CheckEmailPage";
import Home from "../pages/Home";
import MessagePage from "../components/MessagePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "register", element: <RegisterPage /> },
      { path: "password", element: <CheckPasswordPage /> },
      { path: "email", element: <CheckEmailPage /> },
      {
        path: "",
        element: <Home />,
        children: [
          // Correct dynamic parameter with ":" prefix for userId
          { path: ":userId", element: <MessagePage /> },
        ],
      },
    ],
  },
]);

export default router;
