package co.uk.mgbramwell.polling.api.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    /**
     * WebSocket STOMP Endpoint for Poll Vote updates
     * @param pollId - the Poll ID to subscribe for updates
     */
    @SendTo("/topic/poll/{pollId}")
    public void pollSubscribe(@DestinationVariable String pollId) {
    }
}