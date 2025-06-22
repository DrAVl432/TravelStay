import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportRequestController } from './support-request.controller';
import { SupportRequestService } from './support-request.service';
import { SupportRequest, SupportRequestSchema } from './schemas/support-request.schema';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportRequest.name, schema: SupportRequestSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [SupportRequestController],
  providers: [SupportRequestService],
  exports: [SupportRequestService],
})
export class SupportRequestModule {}