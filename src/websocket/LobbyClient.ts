import type {IMessage} from '@stomp/stompjs'
import {Client} from '@stomp/stompjs'

export class LobbyClient {
    private client: Client;

    constructor(lobbyId: string, onMessage: (msg: any) => void) {

        this.client = new Client({
            brokerURL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/chat/ws`,
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: (str) => console.log('[STOMP]', str)
        });

        this.client.onConnect = () => {
            this.client.subscribe(`/user/topic/lobby/${lobbyId}`, (message: IMessage) => {
                const payload = JSON.parse(message.body);
                onMessage(payload);
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ', frame.headers['message'], frame.body);
        };

        this.client.activate();
    }

    send(destination: string, body: any) {
        if (this.client.connected) {
            this.client.publish({destination, body: JSON.stringify(body)});
        }
    }

    async disconnect() {
        if (this.client.active) {
            this.client.reconnectDelay = 0;
            await this.client.deactivate();
        }
    }
}
