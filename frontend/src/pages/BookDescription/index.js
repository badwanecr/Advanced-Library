import { Col, message, Row } from "antd";
import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetBookById } from "../../apicalls/books";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function BookDescription() {
  const [bookData, setBookData] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const getBook = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetBookById(id);
      dispatch(HideLoading());
      if (response.success) {
        setBookData(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    bookData && (
      <div className="mt-1">
        <span className="underline text-sm text-muted" onClick={() => navigate("/")}>
          <i className="ri-arrow-left-line"></i> Back to collection
        </span>

        <Row gutter={[28, 28]} className="mt-1">
          <Col xs={24} sm={24} md={9} lg={7} xl={6}>
            <div className="card" style={{ overflow: "hidden" }}>
              <img
                src={bookData.image}
                alt={bookData.title}
                style={{ width: "100%", height: 440, objectFit: "cover", display: "block" }}
              />
            </div>
          </Col>

          <Col xs={24} sm={24} md={15} lg={17} xl={18}>
            <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
              {bookData?.categories?.map((category) => (
                <span className="badge-pill badge-primary" key={category}>
                  {category}
                </span>
              ))}
            </div>
            <h1 className="text-2xl text-secondary font-bold mt-1">{bookData?.title}</h1>
            <p className="text-muted mt-1">by {bookData?.author}</p>

            <p className="mt-2" style={{ lineHeight: 1.7 }}>
              {bookData?.description}
            </p>

            <div className="info-grid">
              <div className="info-tile">
                <i className="ri-building-4-line"></i>
                <div>
                  <div className="info-tile-label">Publisher</div>
                  <div className="info-tile-value">{bookData?.publisher}</div>
                </div>
              </div>
              <div className="info-tile">
                <i className="ri-calendar-line"></i>
                <div>
                  <div className="info-tile-label">Published Date</div>
                  <div className="info-tile-value">
                    {moment(bookData?.publishedDate).format("MMMM Do YYYY")}
                  </div>
                </div>
              </div>
              <div className="info-tile">
                <i className="ri-money-rupee-circle-line"></i>
                <div>
                  <div className="info-tile-label">Rent Per Day</div>
                  <div className="info-tile-value">₹{bookData?.rentPerDay}</div>
                </div>
              </div>
              <div className="info-tile">
                <i className="ri-stack-line"></i>
                <div>
                  <div className="info-tile-label">Available Copies</div>
                  <div className="info-tile-value">
                    {bookData?.availableCopies} / {bookData?.totalCopies}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  );
}

export default BookDescription;
