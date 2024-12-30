import { createContext, useContext, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const job_application_backend = "http://localhost:5000";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(!!localStorage.getItem("token")); //check token on load
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  async function login(email, password, navigate) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${job_application_backend}/api/auth/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", data.token); // Store the token
      setUser(data.user); // Set the user data
      setIsAuth(true);
      setBtnLoading(false);

      // Redirect to the user-specific dashboard based on role
      if (data.user.role === "admin") {
        navigate(`/admin/${data.user._id}`);
      } else if (data.user.role === "hirer") {
        navigate(`/hirer/${data.user._id}`);
      } else if (data.user.role === "user") {
        navigate(`/user/${data.user._id}`);
      } else {
        navigate("/"); // Default fallback
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed");
      setBtnLoading(false);
    }
  }

  async function register(formData, navigate) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${job_application_backend}/api/auth/register`,
        formData
      );
      toast.success(data.message);
      setBtnLoading(false);

      // auto-login after registration
      if (data.token) {
        console.log("Token after registration:", data.token); // Log the token
        localStorage.setItem("token", data.token); // Store the token
        setUser(data.user); // Set the user data
        setIsAuth(true);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Registration failed");
      setBtnLoading(false);
    }
  }

  // Logout Function
  const logout = (navigate) => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login"); // Redirect to login
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, isAuth, setIsAuth, login, register, btnLoading }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
