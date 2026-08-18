import React, { useEffect } from "react";
import { message, Modal, Table } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { DeleteIssue, GetIssues, ReturnBook } from "../../../apicalls/issues";
import moment from "moment";
import Button from "../../../components/Button";
import IssueForm from "./IssueForm";

function Issues({ open = false, setOpen, selectedBook, reloadBooks }) {
  const [issues, setIssues] = React.useState([]);
  const [selectedIssue, setSelectedIssue] = React.useState(null);
  const [showIssueForm, setShowIssueForm] = React.useState(false);
  const dispatch = useDispatch();

  const getIssues = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetIssues({ bookId: selectedBook.id });
      dispatch(HideLoading());
      if (response.success) {
        setIssues(response.data);
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

  const onReturnHandler = async (issue) => {
    try {
      dispatch(ShowLoading());
      const response = await ReturnBook({ issueId: issue.id });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getIssues();
        reloadBooks();
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
        getIssues();
        reloadBooks();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
    },
    {
      title: "Patron",
      dataIndex: ["user", "name"],
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
      title: "Amount",
      dataIndex: "rent",
      render: (rent, record) => (
        <div className="flex flex-col">
          <span>Rent : {record.rent}</span>
          <span className="text-xs text-gray-500">Fine : {record.fine || 0}</span>
        </div>
      ),
    },
    {
      title: "Returned On",
      dataIndex: "returnedDate",
      render: (returnedDate) =>
        returnedDate ? moment(returnedDate).format("DD-MM-YYYY hh:mm A") : "Not Returned Yet",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (action, record) => {
        return (
          !record.returnedDate && (
            <div className="flex gap-1">
              <Button
                title="Renew"
                onClick={() => {
                  setSelectedIssue(record);
                  setShowIssueForm(true);
                }}
                variant="outlined"
              />
              <Button title="Return Now" onClick={() => onReturnHandler(record)} variant="outlined" />
              <Button title="Delete" variant="outlined" onClick={() => deleteIssueHandler(record)} />
            </div>
          )
        );
      },
    },
  ];

  return (
    <Modal
      title=""
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width="95%"
      style={{ maxWidth: 1400 }}
      centered
    >
      <h1 className="text-xl mt-1 mb-1 text-secondary uppercase font-bold text-center">
        Issues of {selectedBook.title}
      </h1>
      <Table columns={columns} dataSource={issues} rowKey="id" scroll={{ x: "max-content" }} />

      {showIssueForm && (
        <IssueForm
          selectedBook={selectedBook}
          selectedIssue={selectedIssue}
          open={showIssueForm}
          setOpen={setShowIssueForm}
          setSelectedBook={() => {}}
          getData={() => {
            getIssues();
            reloadBooks();
          }}
          type="edit"
        />
      )}
    </Modal>
  );
}

export default Issues;
