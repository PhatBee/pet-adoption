// dto/revenue-query.dto.ts
import { IsIn, IsOptional, IsDateString } from 'class-validator';

export class RevenueQueryDto {
  @IsOptional()
  @IsIn(['week', 'month', 'custom'])
  view?: 'week' | 'month' | 'custom' = 'month';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
