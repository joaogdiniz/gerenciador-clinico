import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import RegisterService from "./components/RegisterService";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login }, // A tela padrão agora é o Login e após o login, vai para a Home
      { path: "home", Component: Home },
      { path: "register", Component: Register },
      { path: "register-service", Component: RegisterService },
    ],
  },
]);
