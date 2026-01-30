import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Blog from "./pages/Blog";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserHome from "./components/user/UserHome";
import Home from "./pages/Home";
import AddPost from "./components/user/AddPost";
import Feed from "./components/user/Feed";
import ProfileInfo from "./components/user/profileinfo";
import ShareArticle from "./components/user/ShareArticle"; // <-- import your new component

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" exact element={<Feed />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/blog/:id" element={<Blog />} />

      {/* User Routes */}
      <Route path="/user" element={<UserHome />}>
        <Route path="dashboard" element={<Home />} />
        <Route path="addpost" element={<AddPost />} />
        <Route path="share-article" element={<ShareArticle />} />{" "}
        {/* <-- new route */}
        <Route path="home" element={<Home />} />
        <Route path="user-profile" element={<ProfileInfo />} />
      </Route>
    </Routes>
  );
};

export default App;
