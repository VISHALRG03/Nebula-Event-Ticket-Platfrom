package com.example.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        ex.printStackTrace();   // 👈 MUST
        return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", ex.getMessage()));
    }


    @ExceptionHandler(EmailAlreadyExistException.class)
    public ResponseEntity<?> handleEmailExists(EmailAlreadyExistException ex) {
        return ResponseEntity
                .status(400)
                .body(Map.of(
                        "success", false,
                        "message", ex.getMessage()
                ));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UserNotFoundException ex) {
        return  ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<?> handleInvalidPassword(InvalidPasswordException ex) {
        return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", ex.getMessage()
        ));
    }
}
