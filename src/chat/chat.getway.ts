// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from './chat.service';


type MessagePayload = {
  text: string;
  sender: string;
  receiver: string;
};

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Socket connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const userSocketMap = await this.redisService.hGetAll('userSocketMap');
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === client.id,
    );

    if (userId) {
      await this.redisService.hDel('userSocketMap', userId);
      await this.redisService.hDel('userActiveChatMap', userId);
      console.log(`User ${userId} disconnected and removed`);
    }
  }

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.redisService.hSet('userSocketMap', data.userId, client.id);
    console.log(`User ${data.userId} registered with socket ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: MessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { sender, receiver, text } = data;
    const [user1Id, user2Id] = [sender, receiver].sort();

    let conversation = await this.prisma.conversation.findFirst({
      where: { user1Id, user2Id },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { user1Id, user2Id },
      });
    }

    const receiverActiveWith = await this.redisService.hGet(
      'userActiveChatMap',
      receiver,
    );

    const savedMessage = await this.prisma.message.create({
      data: {
        text,
        senderId: sender,
        receiverId: receiver,
        conversationId: conversation.id,
        isRead: receiverActiveWith === sender,
      },
    });

    const receiverSocketId = await this.redisService.hGet(
      'userSocketMap',
      receiver,
    );

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receiveMessage', savedMessage);

      if (receiverActiveWith !== sender) {
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            receiverId: receiver,
            isRead: false,
          },
        });

        this.server.to(receiverSocketId).emit('unreadCountUpdate', {
          conversationId: conversation.id,
          count: unreadCount,
          from: sender,
        });
      }
    }

    client.emit('sendSuccessfully', savedMessage);
  }

  @SubscribeMessage('loadMessages')
  async handleLoadMessages(
    @MessageBody() data: { userId1: string; userId2: string },
    @ConnectedSocket() client: Socket,
  ) {
    const [user1Id, user2Id] = [data.userId1, data.userId2].sort();

    const conversation = await this.prisma.conversation.findFirst({
      where: { user1Id, user2Id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (conversation) {
      await this.prisma.message.updateMany({
        where: {
          conversationId: conversation.id,
          receiverId: data.userId1,
          isRead: false,
        },
        data: { isRead: true },
      });

      await this.redisService.hSet(
        'userActiveChatMap',
        data.userId1,
        data.userId2,
      );

      this.server.to(client.id).emit('messagesLoaded', conversation.messages);
      this.server.to(client.id).emit('unreadCountUpdate', {
        conversationId: conversation.id,
        count: 0,
        from: data.userId2,
      });
    } else {
      client.emit('messagesLoaded', []);
    }
  }

  @SubscribeMessage('getConversations')
  async handleGetConversations(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    const userIds = conversations.map((c) =>
      c.user1Id === userId ? c.user2Id : c.user1Id,
    );

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    const unreadCounts = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: userId,
        isRead: false,
      },
      _count: { _all: true },
    });

    const chatUsers = users.map((u) => {
      const countObj = unreadCounts.find((x) => x.senderId === u.id);
      return {
        id: u.id,
        name: u.name,
        hasGoogleAccount: true,
        unreadCount: countObj?._count._all || 0,
      };
    });

    client.emit('conversationsLoaded', chatUsers);
  }
}
