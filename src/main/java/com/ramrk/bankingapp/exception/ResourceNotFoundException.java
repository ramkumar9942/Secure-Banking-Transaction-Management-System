package com.ramrk.bankingapp.exception;

/** Runtime exception thrown when a resource cannot be found */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
