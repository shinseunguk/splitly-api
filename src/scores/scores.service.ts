import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { TeamScoreResponseDto } from './dto/team-score-response.dto';

interface RankOptions {
  nullForZero: boolean;
}

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async listTeams(): Promise<TeamScoreResponseDto[]> {
    return this.loadWithRank({ nullForZero: false });
  }

  async listScores(): Promise<TeamScoreResponseDto[]> {
    return this.loadWithRank({ nullForZero: true });
  }

  async addScore(teamId: number, delta: number): Promise<TeamScoreResponseDto[]> {
    const team = await this.teamRepository.findOne({ where: { teamId } });
    if (!team) {
      throw new NotFoundException(`팀을 찾을 수 없습니다: ${teamId}`);
    }
    team.teamScore = team.teamScore + delta;
    await this.teamRepository.save(team);
    return this.loadWithRank({ nullForZero: true });
  }

  async setScore(teamId: number, value: number): Promise<TeamScoreResponseDto[]> {
    const team = await this.teamRepository.findOne({ where: { teamId } });
    if (!team) {
      throw new NotFoundException(`팀을 찾을 수 없습니다: ${teamId}`);
    }
    team.teamScore = value;
    await this.teamRepository.save(team);
    return this.loadWithRank({ nullForZero: true });
  }

  async resetAll(): Promise<TeamScoreResponseDto[]> {
    await this.teamRepository
      .createQueryBuilder()
      .update(Team)
      .set({ teamScore: 0 })
      .execute();
    return this.loadWithRank({ nullForZero: true });
  }

  private async loadWithRank(opts: RankOptions): Promise<TeamScoreResponseDto[]> {
    const teams = await this.teamRepository.find();
    const sorted = [...teams].sort((a, b) => b.teamScore - a.teamScore);

    let lastScore: number | null = null;
    let lastRank = 0;
    return sorted.map((team, index) => {
      let rank: number | null;
      if (team.teamScore !== lastScore) {
        rank = index + 1;
        lastRank = rank;
        lastScore = team.teamScore;
      } else {
        rank = lastRank;
      }
      if (opts.nullForZero && team.teamScore === 0) {
        rank = null;
      }
      return this.toResponse(team, rank);
    });
  }

  private toResponse(team: Team, rank: number | null): TeamScoreResponseDto {
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      teamScore: team.teamScore,
      teamRank: rank,
      teamLeader: team.teamLeader,
      teamMembers: team.teamMembers,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    };
  }
}
