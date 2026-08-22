package com.libassist.library.controller;

import com.libassist.library.dto.*;
import com.libassist.library.entity.User;
import com.libassist.library.security.AccessGuard;
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
    private final AccessGuard accessGuard;

    @PostMapping("/issue-new-book")
    public ApiResponse<IssueDto> issueNewBook(@Valid @RequestBody IssueRequest request) {
        accessGuard.requireStaff("issue books");
        IssueDto issue = issueService.issueNewBook(request, CurrentUser.id());
        return ApiResponse.success("Book issued successfully", issue);
    }

    @PostMapping("/get-issues")
    public ApiResponse<List<IssueDto>> getIssues(@RequestBody(required = false) IssueFilterRequest filter) {
        User user = accessGuard.currentUser();
        IssueFilterRequest scoped = filter != null ? filter : new IssueFilterRequest();
        if (!accessGuard.isStaff(user)) {
            // a patron may only ever read their own borrowing history, whatever they ask for
            scoped.setUserId(user.getId());
        }
        return ApiResponse.success("Issues fetched successfully", issueService.getIssues(scoped));
    }

    @PostMapping("/return-book")
    public ApiResponse<IssueDto> returnBook(@Valid @RequestBody ReturnBookRequest request) {
        accessGuard.requireStaff("return books on behalf of a patron");
        IssueDto issue = issueService.returnBook(request);
        return ApiResponse.success("Book returned successfully", issue);
    }

    @PostMapping("/delete-issue")
    public ApiResponse<Void> deleteIssue(@Valid @RequestBody DeleteIssueRequest request) {
        accessGuard.requireStaff("delete issues");
        issueService.deleteIssue(request);
        return ApiResponse.success("Issue deleted successfully");
    }

    @PostMapping("/edit-issue")
    public ApiResponse<IssueDto> editIssue(@Valid @RequestBody EditIssueRequest request) {
        accessGuard.requireStaff("edit issues");
        IssueDto issue = issueService.editIssue(request);
        return ApiResponse.success("Issue updated successfully", issue);
    }
}
