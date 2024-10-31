package uk.co.mgbramwell.polling.api.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import uk.co.mgbramwell.polling.model.NewPollMessage;
import uk.co.mgbramwell.polling.model.NewVoteMessage;
import uk.co.mgbramwell.polling.model.WebSocketMessage;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketMessagePublisher {

    private final SimpMessageSendingOperations messagingTemplate;

    public void handleVoteMessage(String choice) {
        WebSocketMessage webSocketMessage =
                NewVoteMessage.builder().choice(choice).build();
        messagingTemplate.convertAndSend("/topic/votes", webSocketMessage);
    }

    public void handlePollMessage(String pollId) {
        WebSocketMessage webSocketMessage =
                NewPollMessage.builder().pollId(pollId).build();
        messagingTemplate.convertAndSend("/topic/votes", webSocketMessage);
    }

}