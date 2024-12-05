import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSessions } from 'src/user-sessions/schema/user-sessions.schema';
import { UserSessionsService } from 'src/user-sessions/service/user-sessions.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Replace with your client URL
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    },
})
export class NotificationGateaway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @InjectModel(UserSessions.name) private sessionModel: Model<UserSessions>,
    private userSessionService: UserSessionsService
) {}

  async handleConnection(client: Socket) {
    const { userId, deviceType } = client.handshake.query;
    console.log(userId, deviceType, "ISINYA APA");
    
    if (!userId || !deviceType) {
      console.log('Invalid connection, disconnecting client.');
      client.disconnect();
      return;
    }

    // Retrieve or initialize session
    const session = await this.sessionModel.findOneAndUpdate(
    { user_id: userId, device_type: deviceType },
    { lastActivity: new Date() },
    { new: true, upsert: true }
    ).exec();

    client.data.sessionId = session._id.toString();
    this.startActivityCheck(client, userId.toString(), deviceType.toString());
    console.log(`Client connected: ${userId} (${deviceType})`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    if (client.data.sessionId) {
      await this.sessionModel.deleteOne({ _id: client.data.sessionId }).exec();
    }
  }

  private startActivityCheck(client: Socket, userId: string, deviceType: string) {
    const interval = setInterval(async () => {
        const session = await this.userSessionService.validateSession(userId, deviceType)

        if(!session){
            console.log(`Session expired for user ${userId}(${deviceType})`);
            client.emit('unauthorized', { message: 'Session expired due to inactivity.' });
            client.disconnect();
            clearInterval(interval);
        }

    }, 60 * 1000); // 1 minute
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(client: Socket) {
    const sessionId = client.data.sessionId;
    if (!sessionId) return;

    await this.sessionModel.findByIdAndUpdate(sessionId, { lastActivity: new Date() }).exec();
    console.log(`Heartbeat updated for session: ${sessionId}`);
  }

  // Emit events to a specific device type
  async sendMessageToDevice(userId: string, deviceType: string, event: string, data: any) {
    const session = await this.sessionModel.findOne({ userId, deviceType }).exec();
    if (session) {
      const client = this.server.sockets.sockets.get(session._id.toString());
      if (client) {
        client.emit(event, data);
      }
    }
  }
}
