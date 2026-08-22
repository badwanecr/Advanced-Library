import { DatePicker, Modal, Select, message } from "antd";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { GetUserById } from "../../../apicalls/users";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { EditIssue, IssueBook } from "../../../apicalls/issues";

function IssueForm({ open = false, setOpen, getData, selectedIssue, type, books = [] }) {
  const isEdit = type === "edit";
  const [validated, setValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [patronData, setPatronData] = useState(null);
  const [bookId, setBookId] = useState(isEdit ? selectedIssue.book.id : null);
  const [patronId, setPatronId] = useState(isEdit ? selectedIssue.user.id : "");
  // held as a dayjs object (or null) - formatted to ISO only when calling the API
  const [returnDate, setReturnDate] = useState(isEdit ? dayjs(selectedIssue.returnDate) : null);
  const dispatch = useDispatch();

  // on edit the book is fixed; on add it comes from the dropdown
  const book = isEdit ? selectedIssue.book : books.find((b) => b.id === bookId);

  const validate = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetUserById(patronId);
      if (response.success) {
        if (response.data.role !== "patron") {
          setValidated(false);
          setErrorMessage("This user is not a patron");
          dispatch(HideLoading());
          return;
        } else {
          setPatronData(response.data);
          setValidated(true);
          setErrorMessage("");
        }
      } else {
        setValidated(false);
        setErrorMessage(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      setValidated(false);
      setErrorMessage(error.message);
    }
  };

  const onIssue = async () => {
    try {
      dispatch(ShowLoading());
      let response = null;
      const isoReturnDate = returnDate.format("YYYY-MM-DD");
      if (!isEdit) {
        response = await IssueBook({
          bookId: book.id,
          userId: patronData.id,
          returnDate: isoReturnDate,
        });
      } else {
        response = await EditIssue({
          issueId: selectedIssue.id,
          returnDate: isoReturnDate,
        });
      }
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getData();
        setBookId(null);
        setPatronId("");
        setReturnDate(null);
        setValidated(false);
        setErrorMessage("");
        setOpen(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (isEdit) {
      validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // whole days between today and the due date - matches how the backend computes rent,
  // so this preview can't disagree with what actually gets charged
  const days = returnDate ? returnDate.startOf("day").diff(dayjs().startOf("day"), "day") : 0;
  const estimatedRent = Math.max(0, days) * (book?.rentPerDay ?? 0);

  // only books with a spare copy can be issued; the backend rejects the rest anyway
  const bookOptions = books
    .filter((b) => b.availableCopies > 0)
    .map((b) => ({
      value: b.id,
      label: `${b.title} — ${b.author} (${b.availableCopies} available)`,
    }));

  const incomplete = !book || patronId === "" || !returnDate;

  return (
    <Modal title="" open={open} onCancel={() => setOpen(false)} footer={null} centered>
      <div className="flex flex-col gap-2">
        <h1 className="text-secondary font-bold text-xl uppercase text-center">
          {isEdit ? "Edit / Renew Issue" : "Issue Book"}
        </h1>

        <div>
          <span>Book </span>
          {isEdit ? (
            <input type="text" value={book.title} disabled />
          ) : (
            <Select
              showSearch
              value={bookId}
              onChange={(value) => {
                setBookId(value);
                setValidated(false);
              }}
              placeholder="Select a book"
              optionFilterProp="label"
              options={bookOptions}
              style={{ width: "100%" }}
              notFoundContent="No books with available copies"
            />
          )}
        </div>

        <div>
          <span>Patron Id </span>
          <input
            type="text"
            value={patronId}
            onChange={(e) => {
              setPatronId(e.target.value);
              setValidated(false);
            }}
            placeholder="Patron Id"
            disabled={isEdit}
          />
        </div>

        <div>
          <span>Return Date </span>
          <DatePicker
            value={returnDate}
            onChange={(date) => setReturnDate(date)}
            format="DD-MM-YYYY"
            placeholder="DD-MM-YYYY"
            style={{ width: "100%" }}
            // a book can't be due back before today
            disabledDate={(current) => current && current < dayjs().startOf("day")}
          />
        </div>

        {errorMessage && <span className="error-message">{errorMessage}</span>}

        {validated && book && (
          <div className="bg-secondary p-1 text-white rounded">
            <h1 className="text-sm">Patron : {patronData.name}</h1>
            <h1 className="text-sm">Book : {book.title}</h1>
            <h1>Number Of Days : {days}</h1>
            <h1>Rent per Day : {book.rentPerDay}</h1>
            <h1>Estimated Rent : {estimatedRent}</h1>
          </div>
        )}

        <div className="flex justify-end gap-2 w-100">
          <Button title="Cancel" variant="outlined" onClick={() => setOpen(false)} />
          {!isEdit && <Button title="Validate" disabled={incomplete} onClick={validate} />}
          {validated && (
            <Button title={isEdit ? "Edit" : "Issue"} onClick={onIssue} disabled={incomplete} />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default IssueForm;
