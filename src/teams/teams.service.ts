import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create({
      teamName: dto.teamName,
      teamLeader: dto.teamLeader,
      teamMembers: dto.teamMembers,
      teamScore: 0,
    });
    return this.teamRepository.save(team);
  }

  async updateTeam(teamId: number, dto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { teamId } });
    if (!team) {
      throw new NotFoundException(`팀을 찾을 수 없습니다: ${teamId}`);
    }
    team.teamName = dto.teamName;
    team.teamLeader = dto.teamLeader;
    team.teamMembers = dto.teamMembers;
    return this.teamRepository.save(team);
  }

  async deleteTeam(teamId: number): Promise<void> {
    const result = await this.teamRepository.delete({ teamId });
    if (result.affected === 0) {
      throw new NotFoundException(`팀을 찾을 수 없습니다: ${teamId}`);
    }
  }
}
