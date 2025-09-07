import { Controller, Post, Patch, Body, Param, Get, Delete} from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support-requests')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('/')
  async createSupportRequest(@Body() { userId, text }: { userId: string; text: string }) {
    return await this.supportService.createSupportRequest(userId, text);
  }

  @Get('/:id/messages')
  async getMessages(@Param('id') id: string) {
    return await this.supportService.getMessages(id);
  }

    @Post('/:id/send')
  async sendMessage(
    @Param('id') supportRequestId: string,
    @Body() { author, text }: { author: string; text: string }
  ) {
    return await this.supportService.sendMessage(supportRequestId, author, text);
   }


@Patch('/mark-read')
async markMessagesAsRead(
  @Body() { user, supportRequest, createdBefore }: { user: string; supportRequest: string; createdBefore: Date }
) {
  return await this.supportService.markMessagesAsRead(user, supportRequest, createdBefore);
}


@Get('/:id/unread-count')
async getUnreadCount(@Param('id') supportRequestId: string) {
  return await this.supportService.getUnreadCount(supportRequestId);
}


@Delete('/:id/close')
async closeRequest(@Param('id') supportRequestId: string) {
  return await this.supportService.closeRequest(supportRequestId);
}

}


