import React from "react";
import { useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";

const AdminDashboard = () => {
  const { logout } = UserData();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to Admin Dashboard</h1>
      <button onClick={() => logout(navigate)} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
