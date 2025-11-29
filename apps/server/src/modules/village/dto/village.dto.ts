import { IsString, IsOptional, IsIn, IsArray, IsObject } from 'class-validator';

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

  @IsObject()
  @IsOptional()
  pointRules?: {
    post?: number;
    comment?: number;
    rsvp?: number;
    like_received?: number;
  };
}

export class JoinVillageDto {
  @IsString()
  @IsOptional()
  inviteCode?: string;
}

export class TransferOwnershipDto {
  @IsString()
  newOwnerId: string;
}
