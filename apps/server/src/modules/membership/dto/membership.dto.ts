import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PrivacySettingsDto {
  @IsBoolean()
  @IsOptional()
  showEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  showPhone?: boolean;

  @IsBoolean()
  @IsOptional()
  showLocation?: boolean;

  @IsBoolean()
  @IsOptional()
  showSocials?: boolean;
}

export class UpdateMembershipDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  @IsOptional()
  privacy?: PrivacySettingsDto;
}

export class UpdateRoleDto {
  @IsString()
  @IsIn(['chief', 'core_member', 'villager'])
  role: string;
}
