import { DatePicker, Modal, message } from "antd";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { GetUserById } from "../../../apicalls/users";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { EditIssue, IssueBook } from "../../../apicalls/issues";

function IssueForm({
  open = false,
  setOpen,
  selectedBook,
  setSelectedBook,
  getData,
  selectedIssue,
  type,
}) {
  const [validated, setValidated] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [patronData, setPatronData] = useState(null);
  const [patronId, setPatronId] = React.useState(type === "edit" ? selectedIssue.user.id : "");
  // held as a dayjs object (or null) - formatted to ISO only when calling the API
  const [returnDate, setReturnDate] = React.useState(
    type === "edit" ? dayjs(selectedIssue.returnDate) : null
  );
  const dispatch = useDispatch();

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
      if (type !== "edit") {
        response = await IssueBook({
          bookId: selectedBook.id,
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
        setPatronId("");
        setReturnDate(null);
        setValidated(false);
        setErrorMessage("");
        setSelectedBook(null);
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
    if (type === "edit") {
      validate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // whole days between today and the due date - matches how the backend computes rent,
  // so this preview can't disagree with what actually gets charged
  const days = returnDate ? returnDate.startOf("day").diff(dayjs().startOf("day"), "day") : 0;
  const estimatedRent = Math.max(0, days) * (selectedBook?.rentPerDay ?? 0);

  return (
    <Modal title="" open={open} onCancel={() => setOpen(false)} footer={null} centered>
      <div className="flex flex-col gap-2">
        <h1 className="text-secondary font-bold text-xl uppercase text-center">
          {type === "edit" ? "Edit / Renew Issue" : "Issue Book"}
        </h1>
        <div>
          <span>Patron Id </span>
          <input
            type="text"
            value={patronId}
            onChange={(e) => setPatronId(e.target.value)}
            placeholder="Patron Id"
            disabled={type === "edit"}
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

        {validated && (
          <div className="bg-secondary p-1 text-white">
            <h1 className="text-sm">Patron : {patronData.name}</h1>
            <h1>Number Of Days : {days}</h1>
            <h1>Rent per Day : {selectedBook.rentPerDay}</h1>
            <h1>Estimated Rent : {estimatedRent}</h1>
          </div>
        )}

        <div className="flex justify-end gap-2 w-100">
          <Button title="Cancel" variant="outlined" onClick={() => setOpen(false)} />
          {type === "add" && (
            <Button
              title="Validate"
              disabled={patronId === "" || !returnDate}
              onClick={validate}
            />
          )}
          {validated && (
            <Button
              title={type === "edit" ? "Edit" : "Issue"}
              onClick={onIssue}
              disabled={patronId === "" || !returnDate}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default IssueForm;
