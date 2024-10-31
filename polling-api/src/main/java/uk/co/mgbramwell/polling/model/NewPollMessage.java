package uk.co.mgbramwell.polling.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Builder
public class NewPollMessage extends WebSocketMessage {
    private String pollId;

    private NewPollMessage(String pollId) {
        super("newpoll");
        this.pollId = pollId;
    }
}
