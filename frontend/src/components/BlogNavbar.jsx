import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { NavLink as ReactNavLink } from "react-router-dom";

const BlogNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userIn, setUserIn] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserIn(false);
  };

  // Check localStorage for token on mount
  useEffect(() => {
    if (localStorage.getItem("token")) {
      setUserIn(true);
    }
  }, []);

  // Optional: update when localStorage changes (after login)
  useEffect(() => {
    const handleStorageChange = () => {
      setUserIn(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Navbar
      expand="md"
      sticky="top"
      style={{ backgroundColor: "#e35726", padding: "0.75rem 1.5rem" }}
    >
      <NavbarBrand
        tag={ReactNavLink}
        to="/"
        style={{ color: "#fff", fontSize: "1.6rem", fontWeight: "bold" }}
      >
        MyBlog
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />

      <Collapse isOpen={isOpen} navbar>
        {/* Left Nav */}
        <Nav className="me-auto" navbar>
          {userIn && (
            <NavItem>
              <NavLink
                tag={ReactNavLink}
                to="/user/dashboard"
                style={{ color: "#fff", fontSize: "1.1rem" }}
              >
                Home
              </NavLink>
            </NavItem>
          )}
        </Nav>

        {/* Search bar */}
        {userIn && (
          <Nav className="my-2 my-md-0" navbar>
            <NavItem
              className="d-flex align-items-center"
              style={{
                backgroundColor: "#fff",
                borderRadius: "50px",
                padding: "0.4rem 0.8rem",
                minWidth: "200px",
              }}
            >
              <FaSearch style={{ color: "grey", fontSize: "1.2rem" }} />
              <input
                type="text"
                placeholder="Search By Category"
                style={{
                  border: "none",
                  outline: "none",
                  marginLeft: "8px",
                  borderRadius: "50px",
                  fontSize: "1rem",
                  width: "100%",
                }}
              />
            </NavItem>
          </Nav>
        )}

        {/* Right Nav */}
        <Nav className="ms-auto" navbar>
          {userIn ? (
            <>
              <NavItem>
                <NavLink
                  tag={ReactNavLink}
                  to="/user/addpost"
                  style={{ color: "#fff", fontSize: "1.1rem" }}
                >
                  Write
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink
                  tag={ReactNavLink}
                  to="/user/share-article"
                  style={{ color: "#fff", fontSize: "1.1rem" }}
                >
                  Share Article
                </NavLink>
              </NavItem>

              <NavItem>
                <NavLink
                  tag={ReactNavLink}
                  to="/login"
                  onClick={handleLogout}
                  style={{ color: "#fff", fontSize: "1.1rem" }}
                >
                  Logout
                </NavLink>
              </NavItem>

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle
                  nav
                  caret
                  style={{ color: "#fff", fontSize: "1.1rem" }}
                >
                  More
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={ReactNavLink} to="/user/user-profile">
                    Profile
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>Contact Us</DropdownItem>
                  <DropdownItem>LinkedIn</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </>
          ) : (
            <>
              <NavItem>
                <NavLink
                  tag={ReactNavLink}
                  to="/login"
                  style={{ color: "#fff", fontSize: "1.1rem" }}
                >
                  Login
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  tag={ReactNavLink}
                  to="/signup"
                  style={{ color: "#fff", fontSize: "1.1rem" }}
                >
                  Signup
                </NavLink>
              </NavItem>
            </>
          )}
        </Nav>
      </Collapse>
    </Navbar>
  );
};

export default BlogNavbar;
