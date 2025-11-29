import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsIn(['Online', 'Offline'])
  type: 'Online' | 'Offline';

  @IsString()
  location: string;

  @IsDateString()
  startTime: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsIn(['Online', 'Offline'])
  type?: 'Online' | 'Offline';

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}

export class RsvpEventDto {
  @IsIn(['going', 'interested', 'not_going'])
  status: 'going' | 'interested' | 'not_going';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
