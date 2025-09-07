import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportGateway } from './support.gateway';
import { SupportRequestSchema } from './schemas/support-request.schema';
import { MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SupportRequest', schema: SupportRequestSchema },
      { name: 'Message', schema: MessageSchema },
    ]),
  ],
  controllers: [SupportController],
  providers: [SupportService, SupportGateway],
})
export class SupportModule {}