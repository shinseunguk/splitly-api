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
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { TeamScoreResponseDto } from './dto/team-score-response.dto';
import { AddScoreDto } from './dto/add-score.dto';
import { SetScoreDto } from './dto/set-score.dto';

@Controller()
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  // trailing slash — TeamModel 호환 (teamRank non-null, 모두 순위 부여)
  @Get('scores/')
  listTeams(): Promise<TeamScoreResponseDto[]> {
    return this.scoresService.listTeams();
  }

  // no trailing slash — TeamScoreModel 호환 (teamRank nullable, 점수 0팀은 null)
  @Get('scores')
  listScores(): Promise<TeamScoreResponseDto[]> {
    return this.scoresService.listScores();
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
}
