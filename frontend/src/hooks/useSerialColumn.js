import { useState } from "react";

/**
 * A "S.No" table column that numbers the rows currently on screen, 1..N.
 *
 * The numbering follows whatever the table is actually showing, so it renumbers when a
 * search/filter narrows the list. It also carries across pages (page 2 continues at 11,
 * not back at 1), which is why the hook owns the pagination state rather than letting
 * the Table manage it internally.
 *
 * @param rowCount number of rows currently in the table's dataSource
 * @returns { serialColumn, paginationProps } - spread paginationProps onto <Table pagination={...} />
 */
export default function useSerialColumn(rowCount = 0, title = "S.No") {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // if a filter shrinks the list past the page you're on, fall back to the last valid page
  const totalPages = Math.max(1, Math.ceil(rowCount / pageSize));
  const safeCurrent = Math.min(current, totalPages);

  const serialColumn = {
    title,
    key: "serial",
    width: 70,
    render: (_value, _record, index) => (safeCurrent - 1) * pageSize + index + 1,
  };

  const paginationProps = {
    current: safeCurrent,
    pageSize,
    onChange: (page, size) => {
      setCurrent(page);
      setPageSize(size);
    },
  };

  return { serialColumn, paginationProps };
}
