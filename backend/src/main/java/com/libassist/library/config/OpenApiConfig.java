package com.libassist.library.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

/**
 * Exposes interactive API docs at /swagger-ui/index.html.
 * Click "Authorize" and paste a JWT (from /api/users/login) to call protected endpoints from the browser.
 */
@OpenAPIDefinition(
        info = @Info(title = "LibAssist API", version = "1.0", description = "Library Management System backend"),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {
}
