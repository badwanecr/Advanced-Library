import { message, Modal, Table, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  DeleteEbook,
  DeleteEbookPdf,
  GetAllEbooks,
  UploadEbookPdf,
} from "../../../apicalls/ebooks";
import Button from "../../../components/Button";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import EbookForm from "./EbookForm";

/** Librarian/admin view of the digital catalogue: titles here need no physical copy. */
function Ebooks() {
  const [formType, setFormType] = useState("add");
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [openEbookForm, setOpenEbookForm] = useState(false);
  const [ebooks, setEbooks] = useState([]);
  const dispatch = useDispatch();

  const getEbooks = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllEbooks();
      dispatch(HideLoading());
      if (response.success) {
        setEbooks(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getEbooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (call) => {
    try {
      dispatch(ShowLoading());
      const response = await call();
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getEbooks();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  };

  const columns = [
    {
      title: "Cover",
      dataIndex: "image",
      render: (image) => <img src={image} alt="ebook" width="60" height="60" />,
    },
    { title: "Title", dataIndex: "title" },
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
    { title: "Author", dataIndex: "author" },
    { title: "Publisher", dataIndex: "publisher" },
    {
      title: "Rent/month",
      dataIndex: "rentPerMonth",
      render: (rent) => `₹${rent}`,
    },
    {
      title: "PDF",
      dataIndex: "hasPdf",
      render: (hasPdf, record) => (
        <div className="flex gap-1 items-center">
          {hasPdf ? (
            <>
              <span className="badge-pill badge-primary">{record.pdfFileName}</span>
              <i
                className="ri-delete-bin-5-line"
                title="Remove PDF"
                onClick={() =>
                  Modal.confirm({
                    title: "Remove this PDF?",
                    content: `"${record.title}" will stay in the catalogue but nobody will be able to read it.`,
                    okText: "Remove",
                    okType: "danger",
                    onOk: () => run(() => DeleteEbookPdf(record.id)),
                  })
                }
              ></i>
            </>
          ) : (
            <Upload
              accept="application/pdf"
              showUploadList={false}
              beforeUpload={(file) => {
                run(() => UploadEbookPdf(record.id, file));
                return false;
              }}
            >
              <span className="text-sm text-secondary cursor-pointer">Upload PDF</span>
            </Upload>
          )}
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => (
        <div className="flex gap-1">
          <i
            className="ri-delete-bin-5-line"
            onClick={() =>
              Modal.confirm({
                title: "Delete this ebook?",
                content: `Are you sure you want to delete "${record.title}"? The PDF is deleted too. This cannot be undone.`,
                okText: "Delete",
                okType: "danger",
                cancelText: "Cancel",
                onOk: () => run(() => DeleteEbook(record.id)),
              })
            }
          ></i>
          <i
            className="ri-pencil-line"
            onClick={() => {
              setFormType("edit");
              setSelectedEbook(record);
              setOpenEbookForm(true);
            }}
          ></i>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="section-heading">
        <h1>Manage eBooks</h1>
        <Button
          title="+ Add eBook"
          onClick={() => {
            setFormType("add");
            setSelectedEbook(null);
            setOpenEbookForm(true);
          }}
        />
      </div>

      <Table columns={columns} dataSource={ebooks} rowKey="id" scroll={{ x: "max-content" }} />

      {openEbookForm && (
        <EbookForm
          open={openEbookForm}
          setOpen={setOpenEbookForm}
          reloadEbooks={getEbooks}
          formType={formType}
          selectedEbook={selectedEbook}
          setSelectedEbook={setSelectedEbook}
        />
      )}
    </div>
  );
}

export default Ebooks;
