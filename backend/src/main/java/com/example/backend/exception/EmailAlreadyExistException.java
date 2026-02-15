package com.example.backend.exception;

public class EmailAlreadyExistException extends  RuntimeException{

    public EmailAlreadyExistException(String message) {
        super(message);
    }
}
