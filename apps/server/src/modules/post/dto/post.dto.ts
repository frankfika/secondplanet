import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
