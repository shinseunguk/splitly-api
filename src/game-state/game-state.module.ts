import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameState } from './entities/game-state.entity';
import { GameStateController } from './game-state.controller';
import { GameStateService } from './game-state.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameState])],
  controllers: [GameStateController],
  providers: [GameStateService],
})
export class GameStateModule {}
