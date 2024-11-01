export class WebSocketMessage {
  pollId: string;
  choice: string;
  message: string;

  constructor(newItem: any) {
    this.pollId = newItem.pollId;
    this.choice = newItem.choice;
    this.message = newItem.message;
  }
}
