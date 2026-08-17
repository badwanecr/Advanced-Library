package com.libassist.library.controller;

import com.libassist.library.dto.ApiResponse;
import com.libassist.library.dto.ReportsDto;
import com.libassist.library.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/get-reports")
    public ApiResponse<ReportsDto> getReports() {
        return ApiResponse.success("Reports fetched successfully", reportService.getReports());
    }
}
