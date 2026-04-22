import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ScoresService } from './scores.service';
import { TeamScoreResponseDto } from './dto/team-score-response.dto';
import { AddScoreDto } from './dto/add-score.dto';
import { SetScoreDto } from './dto/set-score.dto';

@Controller()
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  // 프론트는 '/scores/' (trailing slash)와 '/scores'를 의미적으로 구분함.
  // NestJS 데코레이터가 path의 trailing slash를 정규화하므로, 단일 핸들러에서 originalUrl로 분기.
  //  - /scores/ → TeamModel 호환: 모든 팀에 rank 부여 (teamRank non-null)
  //  - /scores  → TeamScoreModel 호환: 점수 0팀은 teamRank=null
  @Get('scores')
  listScores(@Req() req: Request): Promise<TeamScoreResponseDto[]> {
    const hasTrailingSlash = this.detectTrailingSlash(req.originalUrl);
    return hasTrailingSlash ? this.scoresService.listTeams() : this.scoresService.listScores();
  }

  @Post('scores')
  @HttpCode(201)
  addScore(@Body() dto: AddScoreDto): Promise<TeamScoreResponseDto[]> {
    return this.scoresService.addScore(dto.teamId, dto.score);
  }

  @Put('scores/:teamId')
  @HttpCode(200)
  setScore(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: SetScoreDto,
  ): Promise<TeamScoreResponseDto[]> {
    return this.scoresService.setScore(teamId, dto.score);
  }

  @Delete('scores')
  @HttpCode(200)
  resetAll(): Promise<TeamScoreResponseDto[]> {
    return this.scoresService.resetAll();
  }

  private detectTrailingSlash(originalUrl: string): boolean {
    const pathOnly = originalUrl.split('?')[0];
    return pathOnly.endsWith('/');
  }
}
