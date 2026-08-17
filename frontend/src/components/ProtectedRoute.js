import { message } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetLoggedInUserDetails } from "../apicalls/users";
import { HideLoading, ShowLoading } from "../redux/loadersSlice";
import { SetUser } from "../redux/usersSlice";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const validateUserToken = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetLoggedInUserDetails();
      dispatch(HideLoading());
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        localStorage.removeItem("token");
        navigate("/login");
        message.error(response.message);
      }
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      validateUserToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {user && (
        <div className="p-1">
          <div className="app-header flex justify-between items-center">
            <div className="brand flex items-center gap-1" onClick={() => navigate("/")}>
              <div className="brand-mark">
                <i className="ri-book-3-fill"></i>
              </div>
              <h1 className="brand-title">LibAssist</h1>
            </div>

            <div className="user-chip flex items-center gap-1">
              <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div className="flex flex-col">
                <span className="user-name" onClick={() => navigate("/profile")}>
                  {user.name}
                </span>
                <span className="role-tag">{user.role}</span>
              </div>
              <i
                className="ri-logout-box-r-line icon-btn ml-1"
                title="Logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              ></i>
            </div>
          </div>

          <div className="content mt-1">{children}</div>
        </div>
      )}
    </div>
  );
}

export default ProtectedRoute;
