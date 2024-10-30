package co.uk.mgbramwell.polling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class PollInactiveException extends Exception {
    public PollInactiveException(String pollId) {
        super(String.format("Poll %s is Not Active", pollId));
    }
}
