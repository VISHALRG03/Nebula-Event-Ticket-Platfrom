package com.example.backend.exception;

public class InvalidPasswordException extends  RuntimeException {
    public InvalidPasswordException(String msg) {
        super(msg);
    }
}
