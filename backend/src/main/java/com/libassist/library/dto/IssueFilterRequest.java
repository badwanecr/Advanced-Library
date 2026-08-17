package com.libassist.library.dto;

import lombok.Data;

/** Optional filters for listing issues - by book, by user, or all when both are null. */
@Data
public class IssueFilterRequest {
    private Long bookId;
    private Long userId;
}
