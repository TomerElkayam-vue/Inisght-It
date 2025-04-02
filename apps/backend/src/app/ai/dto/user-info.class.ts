import { Expose } from 'class-transformer';
import { UserInfo } from './../types/user-info.type';
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
