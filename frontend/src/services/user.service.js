// src/services/user.service.js
import { api } from "./api";

const UserService = {
  // REGISTER
  register: async ({ username, email, password, bio }) => {
    console.log("Payload inside service:", { username, email, password, bio });
    const response = await api.post("/users", {
      user: { username, email, password, bio },
    });

    localStorage.setItem("token", response.data.user.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data.user;
  },

  // LOGIN
  login: async (email, password) => {
    const response = await api.post("/users/login", {
      user: { email, password },
    });

    localStorage.setItem("token", response.data.user.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return response.data.user;
  },

  // GET CURRENT USER
  getCurrentUser: async () => {
    const response = await api.get("/user"); // token ajouté automatiquement
    return response.data.user;
  },

  // UPDATE USER
  updateUser: async (userData) => {
    const response = await api.put("/user", { user: userData });
    return response.data.user;
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default UserService;
