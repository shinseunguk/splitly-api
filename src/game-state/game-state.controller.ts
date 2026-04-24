import { Controller, Get, HttpCode, Put } from '@nestjs/common';
import { GameStateService } from './game-state.service';
import { GameStateResponseDto } from './dto/game-state-response.dto';

@Controller('game-state')
export class GameStateController {
  constructor(private readonly gameStateService: GameStateService) {}

  @Get()
  getState(): Promise<GameStateResponseDto> {
    return this.gameStateService.getState();
  }

  @Put()
  @HttpCode(200)
  toggleState(): Promise<GameStateResponseDto> {
    return this.gameStateService.toggleState();
  }
}
