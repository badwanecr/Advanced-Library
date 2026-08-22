import { Tabs } from "antd";
import React from "react";
import Library from "./Library";
import Ebooks from "./Ebooks";

/** The main page: the physical collection and the ebook shelf, side by side. */
function Home() {
  const items = [
    { key: "library", label: "Library", children: <Library /> },
    { key: "ebooks", label: "eBooks", children: <Ebooks /> },
  ];

  return (
    <div className="mt-1">
      <Tabs defaultActiveKey="library" items={items} destroyOnHidden />
    </div>
  );
}

export default Home;
