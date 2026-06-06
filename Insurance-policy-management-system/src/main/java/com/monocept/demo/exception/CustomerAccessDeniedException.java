package com.monocept.demo.exception;

public class CustomerAccessDeniedException
extends RuntimeException {

public CustomerAccessDeniedException(String message) {
super(message);
}
}