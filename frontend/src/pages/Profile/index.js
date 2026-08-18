import React from "react";
import { Tabs } from "antd";
import Books from "./Books";
import Users from "./Users";
import Reports from "./Reports";
import { useSelector } from "react-redux";
import BasicDetails from "./BasicDetails";
import BorrowedBooks from "./BorrowedBooks";

function Profile() {
  const { user } = useSelector((state) => state.users);
  const role = user.role;

  const items = [
    {
      key: "1",
      label: "General",
      children: <BasicDetails />,
    },
  ];

  if (role === "patron") {
    items.push({
      key: "2",
      label: "Books Borrowed",
      children: <BorrowedBooks />,
    });
  }

  if (role !== "patron") {
    items.push(
      { key: "3", label: "Books", children: <Books /> },
      { key: "4", label: "Patrons", children: <Users role="patron" /> }
    );
  }

  if (role === "admin") {
    items.push(
      { key: "5", label: "Librarians", children: <Users role="librarian" /> },
      { key: "6", label: "Admins", children: <Users role="admin" /> },
      { key: "7", label: "Reports", children: <Reports /> }
    );
  }

  return (
    <div>
      <div className="card p-2 profile-tabs-card">
        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </div>
  );
}

export default Profile;
