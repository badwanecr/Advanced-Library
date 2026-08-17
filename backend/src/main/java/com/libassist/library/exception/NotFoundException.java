package com.libassist.library.exception;

/** Thrown when a requested entity does not exist. Mapped to a 200 response with success:false. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
