package uk.co.mgbramwell.polling.api.websocket;

import uk.co.mgbramwell.polling.model.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketMessagePublisher {

    private final SimpMessageSendingOperations messagingTemplate;

    public void handleVoteMessage(String pollId, String oldChoice) {
        WebSocketMessage webSocketMessage =
                WebSocketMessage.builder().pollId(pollId).choice(oldChoice).build();
        messagingTemplate.convertAndSend("/topic/poll/" + pollId, webSocketMessage);
    }

}