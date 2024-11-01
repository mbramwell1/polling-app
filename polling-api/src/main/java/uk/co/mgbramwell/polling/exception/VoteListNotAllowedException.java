package uk.co.mgbramwell.polling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class VoteListNotAllowedException extends Exception {
    public VoteListNotAllowedException() {
        super("You have not voted on this Poll. You can only see Votes for a Closed Poll or a Poll you have voted in.");
    }
}
