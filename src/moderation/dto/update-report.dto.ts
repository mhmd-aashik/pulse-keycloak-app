import { IsString, IsIn } from 'class-validator';

export class UpdateReportDto {
  @IsString()
  @IsIn(['pending', 'resolved'])
  status: 'pending' | 'resolved';
}
