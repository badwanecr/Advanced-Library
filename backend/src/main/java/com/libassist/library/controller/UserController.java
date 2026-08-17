package com.libassist.library.controller;

import com.libassist.library.dto.ApiResponse;
import com.libassist.library.dto.LoginRequest;
import com.libassist.library.dto.RegisterRequest;
import com.libassist.library.dto.UserDto;
import com.libassist.library.security.CurrentUser;
import com.libassist.library.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest request) {
        userService.register(request);
        return ApiResponse.success("User created successfully, please login");
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest request) {
        String token = userService.login(request);
        return ApiResponse.success("Login successful", token);
    }

    @GetMapping("/get-logged-in-user")
    public ApiResponse<UserDto> getLoggedInUser() {
        return ApiResponse.success("User details fetched successfully", userService.getLoggedInUser(CurrentUser.id()));
    }

    @GetMapping("/get-all-users/{role}")
    public ApiResponse<List<UserDto>> getAllUsers(@PathVariable String role) {
        return ApiResponse.success("Users fetched successfully", userService.getAllUsers(role));
    }

    @GetMapping("/get-user-by-id/{id}")
    public ApiResponse<UserDto> getUserById(@PathVariable Long id) {
        return ApiResponse.success("User fetched successfully", userService.getUserById(id));
    }
}
