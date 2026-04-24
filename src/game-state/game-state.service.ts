import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameState } from './entities/game-state.entity';
import { GameStateResponseDto } from './dto/game-state-response.dto';

const SINGLETON_ID = 1;

@Injectable()
export class GameStateService {
  constructor(
    @InjectRepository(GameState)
    private readonly gameStateRepository: Repository<GameState>,
  ) {}

  async getState(): Promise<GameStateResponseDto> {
    const state = await this.ensureState();
    return this.toResponse(state);
  }

  async toggleState(): Promise<GameStateResponseDto> {
    const state = await this.ensureState();
    const nextIsEnded = !state.isEnded;
    state.isEnded = nextIsEnded;
    state.endedAt = nextIsEnded ? new Date() : null;
    await this.gameStateRepository.save(state);
    return this.toResponse(state);
  }

  private async ensureState(): Promise<GameState> {
    let state = await this.gameStateRepository.findOne({
      where: { id: SINGLETON_ID },
    });
    if (!state) {
      state = this.gameStateRepository.create({
        id: SINGLETON_ID,
        isEnded: false,
        endedAt: null,
      });
      await this.gameStateRepository.save(state);
    }
    return state;
  }

  private toResponse(state: GameState): GameStateResponseDto {
    return {
      isEnded: state.isEnded,
      endedAt: state.endedAt ? state.endedAt.toISOString() : null,
      updatedAt: state.updatedAt.toISOString(),
    };
  }
}
