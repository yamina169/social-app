import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { PiSignOutDuotone } from "react-icons/pi";
import { HiInformationCircle } from "react-icons/hi";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineClose } from "react-icons/ai";

const Header = () => {
  const [toggleNavBtn, setToggleNavBtn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🔄 Charger user depuis localStorage de façon safe
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        console.error("Invalid user in localStorage");
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);

    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const signOutHandle = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToggleNavBtn(false);
    navigate("/login");
    window.dispatchEvent(new Event("storage"));
  };

  const getUserInitial = () =>
    user?.username ? user.username.charAt(0).toUpperCase() : "?";

  return (
    <nav className="sticky top-0 z-20 bg-gradient-to-r from-indigo-500 via-purple-400 to-blue-400 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo + Home/Explore */}
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center">
            <h1 className="text-lg font-bold text-white">Tech</h1>
            <span className="text-xl font-bold px-2 text-white rounded-md bg-black/20 ml-1">
              TN
            </span>
          </NavLink>

          <NavLink
            to={user ? "/home" : "/"}
            className="text-white font-semibold px-3 py-2 rounded-md hover:bg-white/20 transition"
          >
            {user ? "Home" : "Explore"}
          </NavLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 font-semibold text-white">
          <NavLink
            to="/about"
            className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-white/20 transition"
          >
            <HiInformationCircle size={20} /> About
          </NavLink>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-lg">
                {getUserInitial()}
              </div>
              <span className="text-white font-medium">{user.username}</span>

              <button
                onClick={signOutHandle}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/40 transition"
              >
                <PiSignOutDuotone size={20} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <NavLink
                to="/login"
                className="bg-black/30 px-3 py-2 rounded-md hover:bg-black/50 transition"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="bg-white/20 px-3 py-2 rounded-md hover:bg-white/40 transition"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <div
            onClick={() => setToggleNavBtn(!toggleNavBtn)}
            className="cursor-pointer text-white"
          >
            {toggleNavBtn ? (
              <AiOutlineClose size={24} />
            ) : (
              <RxHamburgerMenu size={24} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {toggleNavBtn && (
        <div className="md:hidden bg-gradient-to-r from-blue-400 via-gray-300 to-blue-500 flex flex-col items-center gap-4 py-6">
          <NavLink
            to="/about"
            className="flex items-center text-white gap-1 px-4 py-2 rounded-md hover:bg-white/20 transition"
            onClick={() => setToggleNavBtn(false)}
          >
            <HiInformationCircle size={20} /> About
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/home"
                className="text-white px-4 py-2 rounded-md hover:bg-black/30 transition"
                onClick={() => setToggleNavBtn(false)}
              >
                Home
              </NavLink>

              <div className="flex items-center gap-2 px-4 py-2">
                <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {getUserInitial()}
                </div>
                <span className="font-medium text-white">{user.username}</span>
              </div>

              <button
                onClick={signOutHandle}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/40 transition text-white"
              >
                <PiSignOutDuotone size={20} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-white px-4 py-2 rounded-md hover:bg-black/30 transition"
                onClick={() => setToggleNavBtn(false)}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="text-white px-4 py-2 rounded-md hover:bg-black/30 transition"
                onClick={() => setToggleNavBtn(false)}
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
