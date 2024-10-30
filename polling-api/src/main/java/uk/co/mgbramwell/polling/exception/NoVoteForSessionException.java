package uk.co.mgbramwell.polling.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class NoVoteForSessionException extends Exception {
    public NoVoteForSessionException(String pollId, String sessionId) {
        super(String.format("No Vote found for Poll with ID %s on Session %s", pollId, sessionId));
    }
}
