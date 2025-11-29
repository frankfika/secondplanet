import { IsString, IsOptional, IsIn, IsArray } from 'class-validator';

export class CreateVillageDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['Interest', 'Professional', 'Region', 'Lifestyle'])
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  currencyName?: string;

  @IsString()
  @IsOptional()
  currencySymbol?: string;

  @IsString()
  @IsOptional()
  @IsIn(['public', 'private'])
  visibility?: string;
}

export class UpdateVillageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  announcement?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  @IsIn(['public', 'private'])
  visibility?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  constitution?: string[];
}

export class JoinVillageDto {
  @IsString()
  @IsOptional()
  inviteCode?: string;
}
