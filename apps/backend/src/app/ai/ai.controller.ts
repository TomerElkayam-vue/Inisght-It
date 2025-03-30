import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { UserInfoDTO } from './dto/user-info.class';
import type { UserInfo } from './types/user-info.type';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommendation')
  @ApiOperation({ summary: 'Get AI recommendation' })
  @ApiBody({ type: UserInfoDTO })
  getRecommendation(@Body() userInfo: UserInfoDTO) {
    return this.aiService.getAiRecoomendation(userInfo);
  }
}
