package com.likelion.totree.security.exception;

public class DoubleTicketIssueException extends RuntimeException{
    public DoubleTicketIssueException() {
        super("티켓 2장 발급은 12시간에 한 번만 가능합니다.");
    }
}
