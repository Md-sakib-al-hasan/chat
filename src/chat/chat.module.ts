import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.getway';
import { RedisService } from './chat.service';



@Module({
  providers: [ChatGateway,RedisService]
})
export class ChatModule {}
