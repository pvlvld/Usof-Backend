import { Type } from "class-transformer";
import {
  Equals,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength
} from "class-validator";

export type IUserRole = "user" | "admin" | "donator" | "moderator";

export class GetUsersDto {
  @Min(1)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number = 10;
}

export class GetUserByIdDTO {
  @Min(1)
  @Type(() => Number)
  @IsNumber()
  user_id!: number;
}

export class CreateUserDTO {
  @MinLength(2)
  @MaxLength(100)
  @IsString()
  login!: string;

  @MinLength(6)
  @MaxLength(100)
  @IsString()
  password!: string;

  @MinLength(6)
  @MaxLength(100)
  @IsString()
  passwordConfirmation!: string;

  @IsEmail()
  email!: string;

  @IsIn(["user", "admin", "donator"], {
    message: "role must be either 'user', 'admin' or 'donator'"
  })
  @IsString()
  role!: IUserRole;
}

export class UploadUserAvatarDTO {
  @Min(1)
  @IsNumber()
  user_id!: number;

  @MaxLength(100)
  @IsString()
  avatar!: string;
}

export class UpdateUserDataDTO {
  @Min(1)
  @Type(() => Number)
  @IsNumber()
  user_id!: number;

  @MaxLength(100)
  @IsString()
  @IsOptional()
  login?: string;

  @MaxLength(100)
  @IsString()
  @IsOptional()
  email?: string;

  @MinLength(6)
  @MaxLength(100)
  @IsString()
  password!: string;

  @MinLength(6)
  @MaxLength(100)
  @IsString()
  passwordConfirmation!: string;

  @IsIn(["user", "admin", "donator"], {
    message: "role must be either 'user', 'admin' or 'donator'"
  })
  @IsString()
  @IsOptional()
  role?: IUserRole;

  @MaxLength(100)
  @IsString()
  @IsOptional()
  avatar?: string;

  @MaxLength(100)
  @IsString()
  @IsOptional()
  fullName?: string;
}

export class DeleteUserDTO {
  @Min(1)
  @IsNumber()
  user_id!: number;
}

export class BanUserDTO {
  @Min(1)
  @IsNumber()
  user_id!: number;

  @MaxLength(100)
  @IsString()
  banned_until!: string;

  @MaxLength(255)
  @IsString()
  ban_reason!: string;
}

export class UnbanUserDTO {
  @Min(1)
  @IsNumber()
  user_id!: number;
}
