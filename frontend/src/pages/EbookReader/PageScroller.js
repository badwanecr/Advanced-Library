import { InputNumber, message } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FetchEbookPage } from "../../apicalls/ebooks";
import Button from "../../components/Button";

// how far beyond the visible area to fetch ahead, and how many pages to keep in memory
const PREFETCH_PX = 1400;
const KEEP_WITHIN = 6;

/**
 * A scrolling reader built from server-rendered page images. Every page has a slot in one long
 * scroller; a slot's image is fetched as it nears the visible area and released once you have
 * scrolled well past it, so a 300-page book never sits in memory all at once.
 *
 * Which pages to load is worked out from scroll offsets rather than IntersectionObserver: the
 * maths is deterministic, runs on demand, and does not depend on the page being composited.
 */
function PageScroller({ ebookId, pageCount, title }) {
  const [urls, setUrls] = useState({});          // page number -> object URL
  const [current, setCurrent] = useState(1);
  const scrollRef = useRef(null);
  const slotRefs = useRef({});
  const pending = useRef(new Set());
  const urlsRef = useRef({});
  const lastSync = useRef(0);
  const timer = useRef(null);

  urlsRef.current = urls;

  const loadPage = useCallback(
    async (page) => {
      if (urlsRef.current[page] || pending.current.has(page)) return;
      pending.current.add(page);
      try {
        const url = await FetchEbookPage(ebookId, page);
        urlsRef.current = { ...urlsRef.current, [page]: url };
        setUrls(urlsRef.current);
      } catch (error) {
        message.error(error.response?.data?.message || error.message);
      } finally {
        pending.current.delete(page);
      }
    },
    [ebookId]
  );

  /** Work out what is on screen, fetch it, and drop what is far away. */
  const sync = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;

    const viewTop = root.scrollTop - PREFETCH_PX;
    const viewBottom = root.scrollTop + root.clientHeight + PREFETCH_PX;
    const centre = root.scrollTop + root.clientHeight / 2;

    let onScreen = null;
    const wanted = [];

    for (let page = 1; page <= pageCount; page += 1) {
      const slot = slotRefs.current[page];
      if (!slot) continue;
      const top = slot.offsetTop;
      const bottom = top + slot.offsetHeight;
      if (bottom < viewTop) continue;
      if (top > viewBottom) break;            // slots are in order, so nothing later can match
      wanted.push(page);
      if (onScreen === null && bottom >= centre) onScreen = page;
    }

    wanted.forEach(loadPage);
    if (onScreen !== null) setCurrent(onScreen);

    const anchor = onScreen ?? current;
    const stale = Object.keys(urlsRef.current).filter((page) => Math.abs(Number(page) - anchor) > KEEP_WITHIN);
    if (stale.length) {
      const kept = { ...urlsRef.current };
      stale.forEach((page) => {
        URL.revokeObjectURL(kept[page]);
        delete kept[page];
      });
      urlsRef.current = kept;
      setUrls(kept);
    }
  }, [current, loadPage, pageCount]);

  // at most one sync per 100ms however fast the wheel spins, with a trailing run so the last
  // scroll position is always honoured (a timer rather than requestAnimationFrame, which is
  // paused while the tab is in the background)
  const onScroll = useCallback(() => {
    const since = Date.now() - lastSync.current;
    if (since >= 100) {
      lastSync.current = Date.now();
      sync();
    } else if (!timer.current) {
      timer.current = setTimeout(() => {
        timer.current = null;
        lastSync.current = Date.now();
        sync();
      }, 100 - since);
    }
  }, [sync]);

  // Scroll events drive this normally, but they are not guaranteed: momentum scrolling can emit
  // them sparsely, and a programmatic scrollTop change emits none at all. A cheap poll (the loop
  // below stops at the first slot past the viewport) makes sure the visible pages always load.
  useEffect(() => {
    sync();
    const poll = setInterval(sync, 400);
    return () => clearInterval(poll);
  }, [sync]);

  // release every page image when the reader closes
  useEffect(() => {
    return () => {
      Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const jumpTo = (page) => {
    const slot = slotRefs.current[page];
    const root = scrollRef.current;
    if (slot && root) {
      root.scrollTo({ top: slot.offsetTop - 8, behavior: "smooth" });
      setCurrent(page);
      sync();
    }
  };

  return (
    <div className="card mt-2 ebook-viewer">
      <div className="ebook-pager">
        <Button title="Previous" variant="outlined" disabled={current <= 1} onClick={() => jumpTo(current - 1)} />
        <span className="text-sm">
          Page{" "}
          <InputNumber
            size="small"
            min={1}
            max={pageCount}
            value={current}
            onChange={(value) => value && jumpTo(value)}
          />{" "}
          of {pageCount}
        </span>
        <Button title="Next" disabled={current >= pageCount} onClick={() => jumpTo(current + 1)} />
      </div>

      <div
        className="ebook-scroll"
        ref={scrollRef}
        onScroll={onScroll}
        onContextMenu={(event) => event.preventDefault()}
      >
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <div
            key={page}
            data-page={page}
            ref={(node) => {
              slotRefs.current[page] = node;
            }}
            className="ebook-slot"
          >
            {urls[page] ? (
              <img
                src={urls[page]}
                alt={`${title} page ${page}`}
                className="ebook-page"
                draggable={false}
                onLoad={sync}
              />
            ) : (
              <div className="ebook-slot-placeholder">
                <span className="text-sm text-muted">Page {page}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageScroller;
