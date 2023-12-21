package com.likelion.totree.security.exception;

public class TicketIssueException extends RuntimeException{
    public TicketIssueException() {
        super("티켓 1장 발급은 6시간에 한 번만 가능합니다.");
    }
}
