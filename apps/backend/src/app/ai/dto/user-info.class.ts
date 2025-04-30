import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDTO {
  @Expose()
  @ApiProperty()
  amountOfUserStories: number;

  @Expose()
  @ApiProperty()
  amountOfCommentsPerReview: number;

  @Expose()
  @ApiProperty()
  numberOfReviews: number;
}
