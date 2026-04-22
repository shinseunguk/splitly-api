import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTeamDto {
  // 프론트가 teamId를 문자열로 전송함 (teamId.toString()) — 검증만 수행하고 path param을 진실의 원천으로 사용
  @IsOptional()
  @IsString()
  teamId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  teamName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  teamLeader!: string;

  @IsArray()
  @IsString({ each: true })
  teamMembers!: string[];
}
