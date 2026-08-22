import { Col, DatePicker, Modal, Row, Table, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import Button from "../../../components/Button";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { DeleteIssue, GetIssues, ReturnBook } from "../../../apicalls/issues";
import { GetAllBooks } from "../../../apicalls/books";
import useSerialColumn from "../../../hooks/useSerialColumn";
import IssueForm from "./IssueForm";

const { RangePicker } = DatePicker;

function Issues() {
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [formType, setFormType] = useState("add");
  const [showIssueForm, setShowIssueForm] = useState(false);

  // filters
  const [patronQuery, setPatronQuery] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [issuedRange, setIssuedRange] = useState(null);
  const [dueRange, setDueRange] = useState(null);

  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      // books are needed for the "issue a book" dropdown as well as the list itself
      const [issuesResponse, booksResponse] = await Promise.all([GetIssues({}), GetAllBooks()]);
      dispatch(HideLoading());

      if (issuesResponse.success) {
        setIssues(issuesResponse.data);
      } else {
        message.error(issuesResponse.message);
      }
      if (booksResponse.success) {
        setBooks(booksResponse.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReturnHandler = async (issue) => {
    try {
      dispatch(ShowLoading());
      const response = await ReturnBook({ issueId: issue.id });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const deleteIssueHandler = async (issue) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteIssue({ issueId: issue.id });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const withinRange = (value, range) => {
    if (!range || !range[0] || !range[1]) return true;
    const date = dayjs(value);
    return !date.isBefore(range[0].startOf("day")) && !date.isAfter(range[1].endOf("day"));
  };

  const filteredIssues = useMemo(() => {
    const patron = patronQuery.trim().toLowerCase();
    const book = bookQuery.trim().toLowerCase();

    return issues.filter((issue) => {
      if (patron && !issue.user?.name?.toLowerCase().includes(patron)) return false;
      if (book && !issue.book?.title?.toLowerCase().includes(book)) return false;
      if (!withinRange(issue.issueDate, issuedRange)) return false;
      if (!withinRange(issue.returnDate, dueRange)) return false;
      return true;
    });
  }, [issues, patronQuery, bookQuery, issuedRange, dueRange]);

  const clearFilters = () => {
    setPatronQuery("");
    setBookQuery("");
    setIssuedRange(null);
    setDueRange(null);
  };

  const hasFilters = patronQuery || bookQuery || issuedRange || dueRange;

  const { serialColumn, paginationProps } = useSerialColumn(filteredIssues.length);

  const columns = [
    serialColumn,
    {
      title: "Patron",
      dataIndex: ["user", "name"],
    },
    {
      title: "Book",
      dataIndex: ["book", "title"],
    },
    {
      title: "Issued On",
      dataIndex: "issueDate",
      render: (issueDate) => dayjs(issueDate).format("DD-MM-YYYY hh:mm A"),
    },
    {
      title: "Return Date (Due Date)",
      dataIndex: "returnDate",
      render: (dueDate, record) => {
        const overdue = !record.returnedDate && dayjs(dueDate).isBefore(dayjs().startOf("day"));
        return (
          <div className="flex flex-col">
            <span>{dayjs(dueDate).format("DD-MM-YYYY")}</span>
            {overdue && <span className="badge-pill badge-danger">Overdue</span>}
          </div>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "rent",
      render: (rent, record) => (
        <div className="flex flex-col">
          <span>Rent : {record.rent}</span>
          <span className="text-sm text-muted">Fine : {record.fine || 0}</span>
        </div>
      ),
    },
    {
      title: "Returned On",
      dataIndex: "returnedDate",
      render: (returnedDate) =>
        returnedDate ? (
          dayjs(returnedDate).format("DD-MM-YYYY hh:mm A")
        ) : (
          <span className="badge-pill badge-warning">Not Returned</span>
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (action, record) =>
        !record.returnedDate && (
          <div className="flex gap-1">
            <Button
              title="Renew"
              variant="outlined"
              onClick={() => {
                setSelectedIssue(record);
                setFormType("edit");
                setShowIssueForm(true);
              }}
            />
            <Button title="Return Now" variant="outlined" onClick={() => onReturnHandler(record)} />
            <Button
              title="Delete"
              variant="outlined"
              onClick={() =>
                Modal.confirm({
                  title: "Delete this issue?",
                  content: `Delete issue #${record.id} for "${record.book?.title}"? This cannot be undone.`,
                  okText: "Delete",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk: () => deleteIssueHandler(record),
                })
              }
            />
          </div>
        ),
    },
  ];

  return (
    <div>
      <div className="section-heading">
        <h1>Issues</h1>
        <Button
          title="+ Issue Book"
          onClick={() => {
            setSelectedIssue(null);
            setFormType("add");
            setShowIssueForm(true);
          }}
        />
      </div>

      <div className="card p-2 mb-1">
        <Row gutter={[12, 12]} align="bottom">
          <Col xs={24} sm={12} lg={6}>
            <div className="info-tile-label mb-1">Patron</div>
            <input
              type="text"
              placeholder="Search by patron name"
              value={patronQuery}
              onChange={(e) => setPatronQuery(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="info-tile-label mb-1">Book</div>
            <input
              type="text"
              placeholder="Search by book title"
              value={bookQuery}
              onChange={(e) => setBookQuery(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <div className="info-tile-label mb-1">Issued Date</div>
            <RangePicker
              value={issuedRange}
              onChange={(range) => setIssuedRange(range)}
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <div className="info-tile-label mb-1">Due Date</div>
            <RangePicker
              value={dueRange}
              onChange={(range) => setDueRange(range)}
              format="DD-MM-YYYY"
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} lg={2}>
            <Button
              title="Clear"
              variant="outlined"
              fullWidth
              disabled={!hasFilters}
              onClick={clearFilters}
            />
          </Col>
        </Row>

        {hasFilters && (
          <div className="text-sm text-muted mt-1">
            Showing {filteredIssues.length} of {issues.length} issues
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={filteredIssues}
        rowKey="id"
        scroll={{ x: "max-content" }}
        pagination={paginationProps}
      />

      {showIssueForm && (
        <IssueForm
          open={showIssueForm}
          setOpen={setShowIssueForm}
          getData={getData}
          selectedIssue={selectedIssue}
          type={formType}
          books={books}
        />
      )}
    </div>
  );
}

export default Issues;
