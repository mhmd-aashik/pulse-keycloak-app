import { IsString, IsIn, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsIn(['post', 'comment'])
  contentType: 'post' | 'comment';

  @IsUUID()
  contentId: string;

  @IsString()
  reason: string;
}
