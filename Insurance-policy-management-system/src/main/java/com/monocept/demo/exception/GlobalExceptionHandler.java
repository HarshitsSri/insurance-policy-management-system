package com.monocept.demo.exception;



import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.monocept.demo.dto.ErrorResponseDto;

import jakarta.servlet.http.HttpServletRequest;

	@RestControllerAdvice
	public class GlobalExceptionHandler {

	    @ExceptionHandler(DuplicateResourceException.class)
	    public ResponseEntity<ErrorResponseDto> handleDuplicate(
	            DuplicateResourceException ex,
	            HttpServletRequest request) {

	        return new ResponseEntity<>(
	                new ErrorResponseDto(
	                        LocalDateTime.now(),
	                        HttpStatus.BAD_REQUEST.value(),
	                        "Duplicate Resource",
	                        ex.getMessage(),
	                        request.getRequestURI()),
	                HttpStatus.BAD_REQUEST);
	    }

	    @ExceptionHandler(ResourceNotFoundException.class)
	    public ResponseEntity<ErrorResponseDto> handleNotFound(
	            ResourceNotFoundException ex,
	            HttpServletRequest request) {

	        return new ResponseEntity<>(
	                new ErrorResponseDto(
	                        LocalDateTime.now(),
	                        HttpStatus.NOT_FOUND.value(),
	                        "Resource Not Found",
	                        ex.getMessage(),
	                        request.getRequestURI()),
	                HttpStatus.NOT_FOUND);
	    }

	    @ExceptionHandler(InvalidCredentialsException.class)
	    public ResponseEntity<ErrorResponseDto> handleInvalidCredentials(
	            InvalidCredentialsException ex,
	            HttpServletRequest request) {

	        return new ResponseEntity<>(
	                new ErrorResponseDto(
	                        LocalDateTime.now(),
	                        HttpStatus.UNAUTHORIZED.value(),
	                        "Invalid Credentials",
	                        ex.getMessage(),
	                        request.getRequestURI()),
	                HttpStatus.UNAUTHORIZED);
	    }

	    @ExceptionHandler(InactiveUserException.class)
	    public ResponseEntity<ErrorResponseDto> handleInactiveUser(
	            InactiveUserException ex,
	            HttpServletRequest request) {

	        return new ResponseEntity<>(
	                new ErrorResponseDto(
	                        LocalDateTime.now(),
	                        HttpStatus.FORBIDDEN.value(),
	                        "Inactive User",
	                        ex.getMessage(),
	                        request.getRequestURI()),
	                HttpStatus.FORBIDDEN);
	    }

    // Unauthorized Access - 403
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedAccess(
            UnauthorizedAccessException ex) {

        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.FORBIDDEN.value());
        errorBody.put("error", "FORBIDDEN");
        errorBody.put("message", ex.getMessage());

        return new ResponseEntity<>(errorBody, HttpStatus.FORBIDDEN);
    }

    // Invalid Policy Status - 400
    @ExceptionHandler(InvalidPolicyStatusException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidPolicyStatus(
            InvalidPolicyStatusException ex) {

        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("error", "BAD REQUEST");
        errorBody.put("message", ex.getMessage());

        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // Invalid Claim Status - 400
    @ExceptionHandler(InvalidClaimStatusException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidClaimStatus(
            InvalidClaimStatusException ex) {

        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("error", "BAD REQUEST");
        errorBody.put("message", ex.getMessage());

        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // Claim Amount Exceeded - 400
    @ExceptionHandler(ClaimAmountExceededException.class)
    public ResponseEntity<Map<String, Object>> handleClaimAmountExceeded(
            ClaimAmountExceededException ex) {

        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("error", "BAD REQUEST");
        errorBody.put("message", ex.getMessage());

        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // Validation Errors - 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, Object> errorBody = new HashMap<>();
        Map<String, String> validationErrors = new HashMap<>();

        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            validationErrors.put(
                    error.getField(),
                    error.getDefaultMessage());
        }

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("error", "VALIDATION FAILED");
        errorBody.put("message", validationErrors);

        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // Enum Parsing Errors
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidEnum(
            HttpMessageNotReadableException ex) {

        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("error", "INVALID REQUEST");
        errorBody.put("message", "Invalid enum value or malformed JSON");

        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // Missing Path Variable
    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<Map<String, Object>> handleMissingPathVariable(
            MissingPathVariableException ex) {

        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("error", "MISSING PATH VARIABLE");
        errorBody.put("message", ex.getMessage());

        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // Database Constraint Violations
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

    	ex.printStackTrace();   // ADD THIS
        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.CONFLICT.value());
        errorBody.put("error", "DATABASE CONSTRAINT VIOLATION");
        errorBody.put("message", "Duplicate value or foreign key violation");

        return new ResponseEntity<>(errorBody, HttpStatus.CONFLICT);
    }

    // Generic Exception - 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(
            Exception ex) {

        Map<String, Object> errorBody = new HashMap<>();

        errorBody.put("timestamp", LocalDateTime.now());
        errorBody.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorBody.put("error", "INTERNAL SERVER ERROR");
        errorBody.put("message", ex.getMessage());

        return new ResponseEntity<>(
                errorBody,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
