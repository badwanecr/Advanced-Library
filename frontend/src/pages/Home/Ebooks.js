import { Col, Empty, InputNumber, Modal, Row, Badge, message } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetAllEbooks, GetEbookAccess, RentEbook } from "../../apicalls/ebooks";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import Button from "../../components/Button";
import SubscriptionBar from "./SubscriptionBar";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/** Section two: books that have a PDF. Reading one needs a subscription, a rental, or staff role. */
function Ebooks() {
  const [ebooks, setEbooks] = useState([]);
  const [access, setAccess] = useState(null);
  const [search, setSearch] = useState("");
  const [rentTarget, setRentTarget] = useState(null);
  const [months, setMonths] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const [ebooksResponse, accessResponse] = await Promise.all([GetAllEbooks(), GetEbookAccess()]);
      dispatch(HideLoading());
      if (ebooksResponse.success) {
        setEbooks(ebooksResponse.data);
      } else {
        message.error(ebooksResponse.message);
      }
      if (accessResponse.success) {
        setAccess(accessResponse.data);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredEbooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ebooks;
    return ebooks.filter(
      (ebook) =>
        ebook.title?.toLowerCase().includes(query) ||
        ebook.author?.toLowerCase().includes(query) ||
        ebook.categories?.some((category) => category.toLowerCase().includes(query))
    );
  }, [ebooks, search]);

  const confirmRent = async () => {
    try {
      dispatch(ShowLoading());
      const response = await RentEbook({ ebookId: rentTarget.id, months });
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setRentTarget(null);
        load();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.response?.data?.message || error.message);
    }
  };

  const accessLabel = (ebook) => {
    if (!ebook.hasPdf) return "Coming soon";
    if (ebook.accessSource === "role") return "Staff access";
    if (ebook.accessSource === "subscription") return "In your plan";
    if (ebook.accessSource === "rental") return `Rented till ${formatDate(ebook.rentalEndDate)}`;
    return `₹${ebook.rentPerMonth}/month`;
  };

  return (
    <div>
      <SubscriptionBar access={access} onChanged={load} />

      <div className="section-heading">
        <h1>eBooks</h1>
        <div className="search-input-wrap">
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="Search by title, author, category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredEbooks.length === 0 ? (
        <Empty
          description={ebooks.length === 0 ? "No ebooks yet - a librarian can add them from Profile > eBooks" : "No ebooks found"}
          className="mt-3"
        />
      ) : (
        <Row gutter={[20, 20]}>
          {filteredEbooks.map((ebook) => (
            <Col xs={24} sm={24} md={12} lg={6} xl={6} key={ebook.id}>
              <Badge.Ribbon
                text={ebook.canRead ? "Readable" : ebook.hasPdf ? "Locked" : "No file yet"}
                color={ebook.canRead ? "green" : ebook.hasPdf ? "red" : "gray"}
              >
                <div className="card book-card">
                  <img
                    src={ebook.image}
                    alt={ebook.title}
                    className="book-card-image card-hover"
                    onClick={() => navigate(`/ebook/${ebook.id}`)}
                  />
                  <div className="book-card-body">
                    <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                      {ebook.categories?.slice(0, 2).map((category) => (
                        <span className="badge-pill badge-primary" key={category}>
                          {category}
                        </span>
                      ))}
                      {ebook.categories?.length > 2 && (
                        <span className="badge-pill badge-primary">+{ebook.categories.length - 2}</span>
                      )}
                    </div>
                    <h1 className="book-card-title" onClick={() => navigate(`/ebook/${ebook.id}`)}>
                      {ebook.title}
                    </h1>
                    <span className="text-sm text-muted">{ebook.author}</span>
                    <div className="flex justify-between items-center mt-1 gap-1">
                      <span className="text-sm font-bold text-secondary">{accessLabel(ebook)}</span>
                      {ebook.canRead ? (
                        <Button title="Read" onClick={() => navigate(`/ebook/${ebook.id}`)} />
                      ) : (
                        <Button
                          title="Rent"
                          variant="outlined"
                          disabled={!ebook.canRent}
                          onClick={() => {
                            setRentTarget(ebook);
                            setMonths(1);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={rentTarget ? `Rent "${rentTarget.title}"` : ""}
        open={Boolean(rentTarget)}
        onCancel={() => setRentTarget(null)}
        footer={null}
        centered
      >
        {rentTarget && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">
              Reading access for this one book. ₹{rentTarget.rentPerMonth} per month.
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm">Months</span>
              <InputNumber min={1} max={12} value={months} onChange={(value) => setMonths(value || 1)} />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-bold">Total ₹{(rentTarget.rentPerMonth * months).toFixed(2)}</span>
              <Button title="Confirm rent" onClick={confirmRent} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Ebooks;
