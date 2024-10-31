package uk.co.mgbramwell.polling.api.websocket;

import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    /**
     * WebSocket STOMP Endpoint for Active Poll updates
     */
    @SendTo("/topic/votes")
    public void pollSubscribe() {
    }
}