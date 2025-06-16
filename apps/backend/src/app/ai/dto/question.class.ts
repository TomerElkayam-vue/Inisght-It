import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionDTO {
  @Expose()
  @ApiProperty()
  question: string;

  @Expose()
  @ApiProperty()
  data: {
    pullRequests: number;
    codeReviews: number;
    averageCommentsPerPR: number;
    issuesCompleted: number;
    averageIssueTime: number;
    totalStoryPoints: number;
  };

  @Expose()
  @ApiProperty()
  type?: 'worker' | 'team';
}
