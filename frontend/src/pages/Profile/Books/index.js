import { message, Modal, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DeleteBook, GetAllBooks } from "../../../apicalls/books";
import Button from "../../../components/Button";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import BookForm from "./BookForm";

function Books() {
  const [formType, setFormType] = useState("add");
  const [selectedBook, setSelectedBook] = useState(null);
  const [openBookForm, setOpenBookForm] = React.useState(false);
  const [books, setBooks] = React.useState([]);
  const dispatch = useDispatch();

  const getBooks = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllBooks();
      dispatch(HideLoading());
      if (response.success) {
        setBooks(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteBook = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteBook(id);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getBooks();
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
      title: "Book",
      dataIndex: "image",
      render: (image) => <img src={image} alt="book" width="60" height="60" />,
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Categories",
      dataIndex: "categories",
      render: (categories) => (
        <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
          {categories?.map((category) => (
            <span className="badge-pill badge-primary" key={category}>
              {category}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Author",
      dataIndex: "author",
    },
    {
      title: "Publisher",
      dataIndex: "publisher",
    },
    {
      title: "Total Copies",
      dataIndex: "totalCopies",
    },
    {
      title: "Available Copies",
      dataIndex: "availableCopies",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="flex gap-1">
          <i
            class="ri-delete-bin-5-line"
            onClick={() =>
              Modal.confirm({
                title: "Delete this book?",
                content: `Are you sure you want to delete "${record.title}"? This cannot be undone.`,
                okText: "Delete",
                okType: "danger",
                cancelText: "Cancel",
                onOk: () => deleteBook(record.id),
              })
            }
          ></i>
          <i
            className="ri-pencil-line"
            onClick={() => {
              setFormType("edit");
              setSelectedBook(record);
              setOpenBookForm(true);
            }}
          ></i>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className="section-heading">
        <h1>Manage Books</h1>
        <Button
          title="+ Add Book"
          onClick={() => {
            setFormType("add");
            setSelectedBook(null);
            setOpenBookForm(true);
          }}
        />
      </div>

      <Table columns={columns} dataSource={books} rowKey="id" scroll={{ x: "max-content" }} />

      {openBookForm && (
        <BookForm
          open={openBookForm}
          setOpen={setOpenBookForm}
          reloadBooks={getBooks}
          formType={formType}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
        />
      )}
    </div>
  );
}

export default Books;
