import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client } from '@stomp/stompjs';
import { WebSocketMessage } from '../model/websocket-message';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private client: Client | undefined;
  messageReceived: Subject<WebSocketMessage> = new Subject<WebSocketMessage>();

  constructor() {}

  connect(): void {
    this.client = new Client({
      brokerURL: environment.pollApi.url + '/ws',
      onConnect: () => {
        this.client!.subscribe('/topic/votes', (message) => {
          let websocketMessage = new WebSocketMessage(
            JSON.parse(message.body) as WebSocketMessage,
          );
          this.messageReceived.next(websocketMessage);
        });
      },
    });

    this.client!.activate();
  }

  closeConnection(): void {
    if (this.client !== undefined) {
      this.client.deactivate();
    }
  }
}
