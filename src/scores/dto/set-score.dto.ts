import { IsInt, Min } from 'class-validator';

export class SetScoreDto {
  @IsInt()
  @Min(0)
  score!: number;
}
