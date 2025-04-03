import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode"; // Add jwt-decode to decode the token

const job_application_backend = "http://localhost:5000";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const refreshUser = async (token) => {
    if (!token) {
      console.warn("No token found in localStorage.");
      setUser(null);
      setIsAuth(false);
      setLoading(false);
      return;
    }

    try {
      // Decode the token to check expiration
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.log("Token expired, logging out");
        localStorage.removeItem("token");
        setUser(null);
        setIsAuth(false);
        setLoading(false);
        return;
      }

      // Fetch user data from the backend
      const { data } = await axios.get(
        `${job_application_backend}/api/users/current`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.user) {
        setUser(data.user);
        setIsAuth(true);
      } else {
        console.error("User data is undefined in API response.");
        setUser(null);
        setIsAuth(false);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error(
        "Error refreshing user data:",
        error.response?.data || error.message
      );
      setUser(null);
      setIsAuth(false);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  async function login(email, password, navigate) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${job_application_backend}/api/auth/login`,
        { email, password }
      );

      if (!data.token) {
        console.error("Token not found in login response for email:", email);
        throw new Error("Token not found in login response");
      }

      localStorage.setItem("token", data.token);
      console.log("Token set in localStorage:", localStorage.getItem("token"));
      setUser(data.user);
      setIsAuth(true);
      setBtnLoading(false);

      console.log(
        "Navigating for role:",
        data.user.role,
        "to:",
        `/user/${data.user._id}`
      );
      if (data.user.role === "admin") {
        navigate(`/admin/${data.user._id}`);
      } else if (data.user.role === "hirer") {
        navigate(`/hirer/${data.user._id}`);
      } else if (data.user.role === "user") {
        navigate(`/user/${data.user._id}`);
      } else {
        navigate("/");
      }
      console.log("Navigation command executed, waiting for refreshUser...");
      await refreshUser(data.token);
      console.log("refreshUser completed.");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed");
      setBtnLoading(false);
    }
  }

  async function register(formData, navigate) {
    setBtnLoading(true);
    try {
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

      if (data.token) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
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

  const logout = (navigate) => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    refreshUser(token);

    // Listen for changes to localStorage (e.g., after OAuth redirect)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      refreshUser(newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // console.log("Updated user data:", user);
  }, [user]);

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
        logout,
        loading, // Expose loading state
      }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
