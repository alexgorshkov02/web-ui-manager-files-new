import React from "react";

const UserBar = ({ user }) => {
  if (!user) return null;

  return (
    <div>
      <span>{user.username}</span>
    </div>
  );
};

export default UserBar;
