package co.uk.mgbramwell.polling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class UnknownOptionException extends Exception {
    public UnknownOptionException(String pollId, String choice) {
        super(String.format("No Option %s found on Poll ID %s", choice, pollId));
    }
}
