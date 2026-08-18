import { Col, DatePicker, Form, message, Modal, Row, Select } from "antd";
import dayjs from "dayjs";
import React from "react";
import Button from "../../../components/Button";
import { useDispatch } from "react-redux";
import { AddBook, UpdateBook } from "../../../apicalls/books";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";

// Alphabetical by label. The select is in "multiple" mode - typing filters this list but cannot
// invent new values, so typos can't be saved as categories.
const CATEGORY_OPTIONS = [
  { value: "adventure", label: "Adventure" },
  { value: "art", label: "Art" },
  { value: "autobiography", label: "Autobiography" },
  { value: "biography", label: "Biography" },
  { value: "business", label: "Business" },
  { value: "children", label: "Children" },
  { value: "classics", label: "Classics" },
  { value: "comics", label: "Comics" },
  { value: "cookbook", label: "Cookbook" },
  { value: "crime", label: "Crime" },
  { value: "drama", label: "Drama" },
  { value: "economics", label: "Economics" },
  { value: "education", label: "Education" },
  { value: "fantasy", label: "Fantasy" },
  { value: "fiction", label: "Fiction" },
  { value: "health", label: "Health" },
  { value: "history", label: "History" },
  { value: "horror", label: "Horror" },
  { value: "law", label: "Law" },
  { value: "memoir", label: "Memoir" },
  { value: "mystery", label: "Mystery" },
  { value: "mythology", label: "Mythology" },
  { value: "non-fiction", label: "Non-Fiction" },
  { value: "philosophy", label: "Philosophy" },
  { value: "poetry", label: "Poetry" },
  { value: "politics", label: "Politics" },
  { value: "psychology", label: "Psychology" },
  { value: "reference", label: "Reference" },
  { value: "religion", label: "Religion" },
  { value: "romance", label: "Romance" },
  { value: "satire", label: "Satire" },
  { value: "science", label: "Science" },
  { value: "science-fiction", label: "Science Fiction" },
  { value: "self-help", label: "Self-Help" },
  { value: "short-stories", label: "Short Stories" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
  { value: "thriller", label: "Thriller" },
  { value: "travel", label: "Travel" },
  { value: "true-crime", label: "True Crime" },
  { value: "young-adult", label: "Young Adult" },
];

function BookForm({ open, setOpen, reloadBooks, formType, selectedBook, setSelectedBook }) {
  const dispatch = useDispatch();
  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());

      values.rentPerDay = Number(values.rentPerDay);
      values.totalCopies = parseInt(values.totalCopies, 10);
      // DatePicker gives a dayjs object; the API expects an ISO date (yyyy-MM-dd)
      values.publishedDate = values.publishedDate.format("YYYY-MM-DD");

      let response = null;
      if (formType === "add") {
        response = await AddBook(values);
      } else {
        values.id = selectedBook.id;
        response = await UpdateBook(values);
      }
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        reloadBooks();
        setOpen(false);
        setSelectedBook(null);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <Modal
      title={formType === "add" ? "Add Book" : "Update Book"}
      open={open}
      onCancel={() => setOpen(false)}
      centered
      width="95%"
      style={{ maxWidth: 800 }}
      footer={null}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={
          selectedBook
            ? { ...selectedBook, publishedDate: dayjs(selectedBook.publishedDate) }
            : undefined
        }
      >
        <Row gutter={[20]}>
          <Col span={24}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please input book title" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please input book description" }]}
            >
              <textarea type="text" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Image URL"
              name="image"
              rules={[{ required: true, message: "Please input image url" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Author"
              name="author"
              rules={[{ required: true, message: "Please input author name" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Publisher"
              name="publisher"
              rules={[{ required: true, message: "Please input publisher name" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Published Date"
              name="publishedDate"
              rules={[{ required: true, message: "Please select published date" }]}
            >
              <DatePicker
                format="DD-MM-YYYY"
                placeholder="DD-MM-YYYY"
                style={{ width: "100%" }}
                // a catalogued book can't be published in the future
                disabledDate={(current) => current && current > dayjs().endOf("day")}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Categories"
              name="categories"
              rules={[{ required: true, message: "Please select at least one category" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select categories"
                options={CATEGORY_OPTIONS}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Rent Per Day"
              name="rentPerDay"
              rules={[{ required: true, message: "Please input rent per day" }]}
            >
              <input type="number" step="0.01" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Total Copies"
              name="totalCopies"
              rules={[{ required: true, message: "Please input total copies" }]}
            >
              <input type="number" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-2 mt-1">
          <Button type="button" variant="outlined" title="Cancel" onClick={() => setOpen(false)} />
          <Button title="Save" type="submit" />
        </div>
      </Form>
    </Modal>
  );
}

export default BookForm;
