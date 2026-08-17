import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./stylesheets/alignments.css";
import "./stylesheets/theme.css";
import "./stylesheets/sizes.css";
import "./stylesheets/custom-components.css";
import "./stylesheets/form-elements.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";
import { useSelector } from "react-redux";
import Profile from "./pages/Profile";
import BookDescription from "./pages/BookDescription";

const antdTheme = {
  token: {
    colorPrimary: "#0b5c52",
    colorLink: "#0b5c52",
    borderRadius: 8,
    fontFamily: "'Montserrat', sans-serif",
    colorBorder: "#e6e9e8",
  },
  components: {
    Table: {
      headerBg: "#f3f5f4",
      headerColor: "#374542",
      borderColor: "#e6e9e8",
      rowHoverBg: "#f3f8f7",
    },
    Modal: {
      borderRadiusLG: 18,
    },
    Tabs: {
      itemSelectedColor: "#0b5c52",
      inkBarColor: "#0b5c52",
      itemHoverColor: "#12897a",
    },
    Badge: {
      colorError: "#dc2626",
      colorSuccess: "#16a34a",
    },
  },
};

function App() {
  const { loading } = useSelector((state) => state.loaders);
  return (
    <ConfigProvider theme={antdTheme}>
      <div>
        {loading && <Loader />}

        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/:id"
              element={
                <ProtectedRoute>
                  <BookDescription />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ConfigProvider>
  );
}

export default App;
