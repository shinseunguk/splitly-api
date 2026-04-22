import { Controller, Get } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { TeamScoreResponseDto } from './dto/team-score-response.dto';

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
}
