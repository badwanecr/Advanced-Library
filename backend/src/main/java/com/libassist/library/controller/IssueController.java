package com.libassist.library.controller;

import com.libassist.library.dto.*;
import com.libassist.library.security.CurrentUser;
import com.libassist.library.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping("/issue-new-book")
    public ApiResponse<IssueDto> issueNewBook(@Valid @RequestBody IssueRequest request) {
        IssueDto issue = issueService.issueNewBook(request, CurrentUser.id());
        return ApiResponse.success("Book issued successfully", issue);
    }

    @PostMapping("/get-issues")
    public ApiResponse<List<IssueDto>> getIssues(@RequestBody(required = false) IssueFilterRequest filter) {
        return ApiResponse.success("Issues fetched successfully", issueService.getIssues(filter));
    }

    @PostMapping("/return-book")
    public ApiResponse<IssueDto> returnBook(@Valid @RequestBody ReturnBookRequest request) {
        IssueDto issue = issueService.returnBook(request);
        return ApiResponse.success("Book returned successfully", issue);
    }

    @PostMapping("/delete-issue")
    public ApiResponse<Void> deleteIssue(@Valid @RequestBody DeleteIssueRequest request) {
        issueService.deleteIssue(request);
        return ApiResponse.success("Issue deleted successfully");
    }

    @PostMapping("/edit-issue")
    public ApiResponse<IssueDto> editIssue(@Valid @RequestBody EditIssueRequest request) {
        IssueDto issue = issueService.editIssue(request);
        return ApiResponse.success("Issue updated successfully", issue);
    }
}
