import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";

function BasicDetails() {
  const { user } = useSelector((state) => state.users);

  const roleBadgeClass =
    user.role === "admin" ? "badge-secondary" : user.role === "librarian" ? "badge-warning" : "badge-primary";

  return (
    <div>
      <div className="card profile-header-card">
        <div className="avatar avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-1 mt-1">
            <span className={`badge-pill ${roleBadgeClass}`}>{user.role}</span>
            <span className="badge-pill badge-success">{user.status}</span>
          </div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-tile">
          <i className="ri-mail-line"></i>
          <div>
            <div className="info-tile-label">Email</div>
            <div className="info-tile-value">{user.email}</div>
          </div>
        </div>
        <div className="info-tile">
          <i className="ri-phone-line"></i>
          <div>
            <div className="info-tile-label">Phone</div>
            <div className="info-tile-value">{user.phone}</div>
          </div>
        </div>
        <div className="info-tile">
          <i className="ri-calendar-check-line"></i>
          <div>
            <div className="info-tile-label">Registered On</div>
            <div className="info-tile-value">{moment(user.createdAt).format("MMM Do YYYY, h:mm a")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicDetails;
