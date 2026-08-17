import React, { useEffect } from "react";
import { message, Table } from "antd";
import { GetIssues } from "../../../apicalls/issues";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

function IssuedBooks() {
  const { user } = useSelector((state) => state.users);
  const [issuedBooks, setIssuedBooks] = React.useState([]);
  const dispatch = useDispatch();

  const getIssues = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetIssues({ userId: user.id });
      dispatch(HideLoading());
      if (response.success) {
        setIssuedBooks(response.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
    },
    {
      title: "Book",
      dataIndex: "book",
      render: (book) => book.title,
    },
    {
      title: "Issued On",
      dataIndex: "issueDate",
      render: (issueDate) => moment(issueDate).format("DD-MM-YYYY hh:mm A"),
    },
    {
      title: "Return Date (Due Date)",
      dataIndex: "returnDate",
      render: (dueDate) => moment(dueDate).format("DD-MM-YYYY hh:mm A"),
    },
    {
      title: "Rent",
      dataIndex: "rent",
    },
    {
      title: "Fine",
      dataIndex: "fine",
    },
    {
      title: "Returned On",
      dataIndex: "returnedDate",
      render: (returnedDate) =>
        returnedDate ? moment(returnedDate).format("DD-MM-YYYY hh:mm A") : "Not Returned Yet",
    },
  ];
  return (
    <div>
      <div className="section-heading">
        <h1>Books Borrowed</h1>
      </div>
      <Table columns={columns} dataSource={issuedBooks} rowKey="id" />
    </div>
  );
}

export default IssuedBooks;
