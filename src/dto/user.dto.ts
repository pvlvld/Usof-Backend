import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export class GetUsersDto {
  @IsNumber()
  @Min(1)
  page!: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  limit!: number;
}

export class GetUserByIdDTO {
  @IsNumber()
  @Min(1)
  user_id!: number;
}

export class CreateUserDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  login!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  passwordConfirmation!: string;

  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(50)
  role!: string;
}

export class UploadUserAvatarDTO {
  @IsString()
  @MaxLength(100)
  user_id!: string;

  @IsString()
  @MaxLength(100)
  avatar!: string;
}

export class UpdateUserDataDTO {
  @IsString()
  @MaxLength(100)
  user_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  login?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}

export class DeleteUserDTO {
  @IsNumber()
  @Min(1)
  user_id!: number;
}
