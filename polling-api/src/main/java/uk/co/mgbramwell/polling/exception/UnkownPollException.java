package uk.co.mgbramwell.polling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class UnkownPollException extends Exception {
    public UnkownPollException(String pollId) {
        super(String.format("No Poll found with ID %s", pollId));
    }
}
