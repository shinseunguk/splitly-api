import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
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
