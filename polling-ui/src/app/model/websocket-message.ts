export class WebSocketMessage {
    pollId: string;
    choice: string;

    constructor(newItem: any) {
        this.pollId = newItem.pollId;
        this.choice = newItem.choice;
    }
}