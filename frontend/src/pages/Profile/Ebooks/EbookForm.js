import { Col, DatePicker, Form, message, Modal, Row, Select } from "antd";
import dayjs from "dayjs";
import React from "react";
import Button from "../../../components/Button";
import { useDispatch } from "react-redux";
import { AddEbook, UpdateEbook } from "../../../apicalls/ebooks";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { CATEGORY_OPTIONS } from "../../../constants/categories";

/** Same catalogue fields as a printed book, minus anything about copies on a shelf. */
function EbookForm({ open, setOpen, reloadEbooks, formType, selectedEbook, setSelectedEbook }) {
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      values.rentPerMonth = Number(values.rentPerMonth);
      values.publishedDate = values.publishedDate.format("YYYY-MM-DD");

      let response = null;
      if (formType === "add") {
        response = await AddEbook(values);
      } else {
        values.id = selectedEbook.id;
        response = await UpdateEbook(values);
      }
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        reloadEbooks();
        setOpen(false);
        setSelectedEbook(null);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <Modal
      title={formType === "add" ? "Add eBook" : "Update eBook"}
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
          selectedEbook
            ? { ...selectedEbook, publishedDate: dayjs(selectedEbook.publishedDate) }
            : undefined
        }
      >
        <Row gutter={[20]}>
          <Col span={24}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please input ebook title" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please input description" }]}
            >
              <textarea rows={4} />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item
              label="Categories"
              name="categories"
              rules={[{ required: true, message: "Please select at least one category" }]}
            >
              <Select mode="multiple" allowClear options={CATEGORY_OPTIONS} placeholder="Select categories" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item
              label="Cover image URL"
              name="image"
              rules={[{ required: true, message: "Please input cover image URL" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item
              label="Author"
              name="author"
              rules={[{ required: true, message: "Please input author" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item
              label="Publisher"
              name="publisher"
              rules={[{ required: true, message: "Please input publisher" }]}
            >
              <input type="text" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item
              label="Published date"
              name="publishedDate"
              rules={[{ required: true, message: "Please select published date" }]}
            >
              <DatePicker className="w-100" format="DD-MM-YYYY" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item
              label="Rent per month (₹)"
              name="rentPerMonth"
              rules={[{ required: true, message: "Please input rent per month" }]}
            >
              <input type="number" min="1" step="0.5" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-1">
          <Button title="Cancel" variant="outlined" onClick={() => setOpen(false)} />
          <Button title="Save" type="submit" />
        </div>
      </Form>
    </Modal>
  );
}

export default EbookForm;
