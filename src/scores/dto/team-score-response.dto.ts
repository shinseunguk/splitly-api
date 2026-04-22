export class TeamScoreResponseDto {
  teamId!: number;
  teamName!: string;
  teamScore!: number;
  teamRank!: number | null;
  teamLeader!: string;
  teamMembers!: string[];
  createdAt!: string;
  updatedAt!: string;
}
