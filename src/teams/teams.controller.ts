import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamCreateResponseDto } from './dto/team-create-response.dto';
import { ApiMessages } from '../common/constants/api-messages';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @HttpCode(201)
  async createTeam(@Body() dto: CreateTeamDto): Promise<TeamCreateResponseDto> {
    const team = await this.teamsService.createTeam(dto);
    return { teamId: team.teamId, message: ApiMessages.teamCreated };
  }

  @Put(':teamId')
  @HttpCode(200)
  async updateTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: UpdateTeamDto,
  ): Promise<TeamCreateResponseDto> {
    const team = await this.teamsService.updateTeam(teamId, dto);
    return { teamId: team.teamId, message: ApiMessages.teamUpdated };
  }

  @Delete(':teamId')
  @HttpCode(204)
  async deleteTeam(@Param('teamId', ParseIntPipe) teamId: number): Promise<void> {
    await this.teamsService.deleteTeam(teamId);
  }
}
