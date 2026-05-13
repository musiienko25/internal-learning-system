import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';

@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true },
})
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('ping')
  handlePing(): { ts: number; message: string } {
    this.logger.debug('ping');
    return { ts: Date.now(), message: 'pong' };
  }
}
