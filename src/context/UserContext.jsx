import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const job_application_backend = "http://localhost:5000";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Start with null

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
      // no registration attempts for admin role
      if (formData.role === "admin") {
        toast.error("Cannot register as admin.");
        setBtnLoading(false);
        return;
      }
      const { data } = await axios.post(
        `${job_application_backend}/api/auth/register`,
        formData
      );
      toast.success(data.message);
      setBtnLoading(false);

      // auto-login after registration
      if (data.token) {
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

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage.");
      return;
    }
    try {
      const { data } = await axios.get(
        `${job_application_backend}/api/users/current`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data?.user) {
        console.log("Fetched user data in refreshUser:", data.user);
        setUser(data.user);
        setIsAuth(true);
      } else {
        console.error("User data is undefined in API response.");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setUser(null);
      setIsAuth(false);
    }
  };
  useEffect(() => {
    console.log("Updated user data:", user);
  }, [user]);

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        login,
        register,
        btnLoading,
        refreshUser,
      }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
