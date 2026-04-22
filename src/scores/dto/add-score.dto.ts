import { IsInt, IsPositive } from 'class-validator';

export class AddScoreDto {
  @IsInt()
  @IsPositive()
  teamId!: number;

  // 음수 허용 — 프론트에 -10/-5/-3/-1 차감 버튼이 있어 delta에 음수가 올 수 있음
  @IsInt()
  score!: number;
}
