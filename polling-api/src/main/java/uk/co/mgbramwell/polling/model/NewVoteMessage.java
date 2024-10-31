package uk.co.mgbramwell.polling.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Builder
public class NewVoteMessage extends WebSocketMessage {
    private String choice;

    private NewVoteMessage(String choice) {
        super("newvote");
        this.choice = choice;
    }
}
