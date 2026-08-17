import { Col, message, Row, Badge, Empty } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetAllBooks } from "../../apicalls/books";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";

function Home() {
  const [books, setBooks] = React.useState([]);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return books;
    return books.filter(
      (book) =>
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.categories?.some((category) => category.toLowerCase().includes(query))
    );
  }, [books, search]);

  return (
    <div className="mt-1">
      <div className="section-heading">
        <h1>Explore the Collection</h1>
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

      {filteredBooks.length === 0 ? (
        <Empty description="No books found" className="mt-3" />
      ) : (
        <Row gutter={[20, 20]}>
          {filteredBooks.map((book) => {
            return (
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={6}
                xl={6}
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <Badge.Ribbon
                  text={book.availableCopies > 0 ? "Available" : "Not Available"}
                  color={book.availableCopies > 0 ? "green" : "red"}
                >
                  <div className="card card-hover book-card">
                    <img src={book.image} alt={book.title} className="book-card-image" />
                    <div className="book-card-body">
                      <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                        {book.categories?.slice(0, 2).map((category) => (
                          <span className="badge-pill badge-primary" key={category}>
                            {category}
                          </span>
                        ))}
                        {book.categories?.length > 2 && (
                          <span className="badge-pill badge-primary">+{book.categories.length - 2}</span>
                        )}
                      </div>
                      <h1 className="book-card-title">{book.title}</h1>
                      <span className="text-sm text-muted">{book.author}</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-bold text-secondary">₹{book.rentPerDay}/day</span>
                        <span className="text-sm text-muted">{book.availableCopies} left</span>
                      </div>
                    </div>
                  </div>
                </Badge.Ribbon>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}

export default Home;
