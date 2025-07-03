import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.service';


@Module({
  providers: [ChatGateway]
})
export class ChatModule {}
