import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaPlusCircle, FaHistory } from "react-icons/fa";

const UserSidebar = () => {
  const location = useLocation();

  const items = [
    { name: "Home", path: "/home", icon: <FaHome className="text-lg" /> },
    { name: "Profile", path: "/profile", icon: <FaUser className="text-lg" /> },
    {
      name: "Create",
      path: "/create-blog",
      icon: <FaPlusCircle className="text-lg" />,
    },
    {
      name: "History",
      path: "/history",
      icon: <FaHistory className="text-lg" />,
    },
  ];

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
      location.pathname === path || location.pathname.startsWith(path + "/")
        ? "bg-indigo-200 text-indigo-700 shadow-lg"
        : "text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
    }`;

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed  border-r top-20 bottom-0 left-0 w-48 md:w-60  p-5 flex-col">
        <nav className="flex flex-col gap-3">
          {items.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={linkClass(item.path)}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow z-20 flex justify-around py-2">
        {items.map((item) => {
          const active =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center text-sm ${
                active ? "text-indigo-700" : "text-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default UserSidebar;
