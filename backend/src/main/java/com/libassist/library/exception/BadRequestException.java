package com.libassist.library.exception;

/** Thrown for domain-level validation failures (e.g. "email already exists"). Mapped to a 200 response with success:false. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
