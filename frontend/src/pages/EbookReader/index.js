import { InputNumber, message, Modal } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetEbookById, GetEbookPageCount, RentEbook } from "../../apicalls/ebooks";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import Button from "../../components/Button";
import PageScroller from "./PageScroller";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/**
 * Ebook detail page and reader. Pages arrive one at a time as watermarked images rendered on the
 * server, so the browser never holds the PDF and offers no way to save it.
 */
function EbookReader() {
  const { id } = useParams();
  const [ebook, setEbook] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [reading, setReading] = useState(false);
  const [renting, setRenting] = useState(false);
  const [months, setMonths] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetEbookById(id);
      dispatch(HideLoading());
      if (response.success) {
        setEbook(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  }, [dispatch, id]);

  useEffect(() => {
    load();
  }, [load]);

  const startReading = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetEbookPageCount(id);
      if (!response.success) {
        dispatch(HideLoading());
        message.error(response.message);
        return;
      }
      setPageCount(response.data);
      dispatch(HideLoading());
      setReading(true);
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  };

  const confirmRent = async () => {
    try {
      dispatch(ShowLoading());
      const response = await RentEbook({ ebookId: Number(id), months });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setRenting(false);
        load();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  };

  if (!ebook) return null;

  return (
    <div className="mt-1">
      <div className="flex items-center gap-1">
        <i className="ri-arrow-left-line cursor-pointer" onClick={() => navigate("/")}></i>
        <h1 className="text-xl font-bold">{ebook.title}</h1>
      </div>

      <div className="card mt-2 ebook-detail">
        <img src={ebook.image} alt={ebook.title} className="ebook-detail-image" />
        <div className="flex flex-col gap-1">
          <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
            {ebook.categories?.map((category) => (
              <span className="badge-pill badge-primary" key={category}>
                {category}
              </span>
            ))}
          </div>
          <span className="text-sm text-muted">
            {ebook.author} · {ebook.publisher} · {formatDate(ebook.publishedDate)}
          </span>
          <p className="text-sm">{ebook.description}</p>

          {ebook.accessSource === "rental" && (
            <span className="text-sm font-bold text-secondary">
              Rented until {formatDate(ebook.rentalEndDate)}
            </span>
          )}
          {ebook.accessSource === "subscription" && (
            <span className="text-sm font-bold text-secondary">Included in your subscription</span>
          )}

          <div className="flex gap-1 mt-1 items-center">
            {!ebook.hasPdf ? (
              <span className="text-sm text-muted">
                This title is in the catalogue but its PDF has not been uploaded yet.
              </span>
            ) : ebook.canRead ? (
              <Button title={reading ? "Reading" : "Read now"} onClick={startReading} disabled={reading} />
            ) : (
              <>
                <span className="text-sm text-muted">
                  Subscribe from the eBooks tab, or rent just this book at ₹{ebook.rentPerMonth}/month.
                </span>
                <Button title="Rent this book" onClick={() => setRenting(true)} disabled={!ebook.canRent} />
              </>
            )}
          </div>
        </div>
      </div>

      {reading && pageCount > 0 && (
        <PageScroller ebookId={id} pageCount={pageCount} title={ebook.title} />
      )}

      <Modal
        title={`Rent "${ebook.title}"`}
        open={renting}
        onCancel={() => setRenting(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="text-sm">Months</span>
            <InputNumber min={1} max={12} value={months} onChange={(value) => setMonths(value || 1)} />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="font-bold">Total ₹{(ebook.rentPerMonth * months).toFixed(2)}</span>
            <Button title="Confirm rent" onClick={confirmRent} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EbookReader;
