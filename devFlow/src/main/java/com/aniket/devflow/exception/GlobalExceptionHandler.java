package com.aniket.devflow.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> handleIllegalArgumentException(
            IllegalArgumentException exception
    ) {
        return Map.of(
                "message",
                exception.getMessage()
        );
    }
    @ExceptionHandler(IllegalStateException.class)
@ResponseStatus(HttpStatus.FORBIDDEN)
public Map<String, String> handleIllegalStateException(
        IllegalStateException exception
) {
    return Map.of(
            "message",
            exception.getMessage()
    );
}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidationException(
            MethodArgumentNotValidException exception
    ) {
        Map<String, String> errors = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("message", "Validation failed");
        response.put("errors", errors);

        return response;
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleResourceNotFoundException(
            ResourceNotFoundException exception
    ) {
        return Map.of(
                "message",
                exception.getMessage()
        );
    }
}