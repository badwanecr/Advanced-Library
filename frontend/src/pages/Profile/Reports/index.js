import { Col, message, Row } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { GetReports } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";

function StatCard({ icon, title, accentVar, accentTintVar, rows }) {
  return (
    <div
      className="card stat-card"
      style={{ "--accent-colour": accentVar, "--accent-tint": accentTintVar }}
    >
      <div className="stat-card-header">
        <div className="stat-icon">
          <i className={icon}></i>
        </div>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>

      {rows.map((row) => (
        <div className="stat-row" key={row.label}>
          <span className="text-sm text-muted">{row.label}</span>
          <span className="stat-value">{row.value ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

function Reports() {
  const [reports, setReports] = React.useState(null);

  const dispatch = useDispatch();
  const getReports = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetReports();
      dispatch(HideLoading());
      if (response.success) {
        setReports(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon="ri-book-2-line"
            title="Books"
            accentVar="var(--colour-primary)"
            accentTintVar="rgba(11, 92, 82, 0.12)"
            rows={[
              { label: "Total Books", value: reports?.books?.booksCount },
              { label: "Total Copies", value: reports?.books?.totalBooksCopiesCount },
              { label: "Available Copies", value: reports?.books?.availableBooksCopiesCount },
              { label: "Issued Copies", value: reports?.books?.issuedBooksCopiesCount },
            ]}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon="ri-team-line"
            title="Users"
            accentVar="var(--colour-info)"
            accentTintVar="rgba(37, 99, 235, 0.12)"
            rows={[
              { label: "Total Users", value: reports?.users?.usersCount },
              { label: "Patrons", value: reports?.users?.patronsCount },
              { label: "Librarians", value: reports?.users?.librariansCount },
              { label: "Admins", value: reports?.users?.adminsCount },
            ]}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon="ri-exchange-line"
            title="Issues"
            accentVar="var(--colour-warning)"
            accentTintVar="rgba(217, 119, 6, 0.12)"
            rows={[
              { label: "Total Issues", value: reports?.issues?.issuesCount },
              { label: "Returned Issues", value: reports?.issues?.returnedIssuesCount },
              { label: "Pending Issues", value: reports?.issues?.pendingIssuesCount },
            ]}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            icon="ri-money-rupee-circle-line"
            title="Revenue"
            accentVar="var(--colour-secondary)"
            accentTintVar="rgba(122, 50, 16, 0.12)"
            rows={[
              { label: "Total Revenue", value: `₹${reports?.revenue?.totalCollected ?? 0}` },
              { label: "Rent Collected", value: `₹${reports?.revenue?.rentCollected ?? 0}` },
              { label: "Penalty Collected", value: `₹${reports?.revenue?.fineCollected ?? 0}` },
              { label: "Rent Pending", value: `₹${reports?.revenue?.rentPending ?? 0}` },
            ]}
          />
        </Col>
      </Row>
    </div>
  );
}

export default Reports;
