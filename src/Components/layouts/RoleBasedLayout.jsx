import React from "react";
import { UserData } from "../../context/UserContext";
import FreelancerLayout from "./FreelancerLayout";
import HirerLayout from "./HirerLayout";

const RoleBasedLayout = ({ children }) => {
  const { user } = UserData();

  if (!user) return <div>Loading user info...</div>;

  if (user.role === "hirer") return <HirerLayout>{children}</HirerLayout>;
  if (user.role === "user")
    return <FreelancerLayout>{children}</FreelancerLayout>;

  return <div>Invalid role</div>;
};

export default RoleBasedLayout;
