package co.uk.mgbramwell.polling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class AlreadyVotedException extends Exception {
    public AlreadyVotedException(String pollId, String choice) {
        super(String.format("Vote for %s already Placed on Poll %s", choice, pollId));
    }
}
