import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SupportRequestService } from './support-request.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetChatListParams } from './dto/get-chat-list-params.dto';

@Controller('support-requests')
export class SupportRequestController {
  constructor(private readonly supportRequestService: SupportRequestService) {}

  @Post()
  async createRequest(@Body() createRequestDto: CreateSupportRequestDto) {
    return this.supportRequestService.createSupportRequest(createRequestDto);
  }

  @Post('messages')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return this.supportRequestService.sendMessage(sendMessageDto);
  }

  @Get()
  async getChatList(@Query() params: GetChatListParams) {
    return this.supportRequestService.findSupportRequests(params);
  }
}