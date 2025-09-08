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
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;
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
  @IsIn(["user", "admin", "donator"], {
    message: "role must be either 'user', 'admin' or 'donator'"
  })
  role!: IUserRole;
}

export class UploadUserAvatarDTO {
  @IsNumber()
  @Min(1)
  user_id!: number;

  @IsString()
  @MaxLength(100)
  avatar!: string;
}

export class UpdateUserDataDTO {
  @IsOptional()
  @IsNumber()
  @Min(1)
  user_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  login?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  passwordConfirmation!: string;

  @IsOptional()
  @IsString()
  @IsIn(["user", "admin", "donator"], {
    message: "role must be either 'user', 'admin' or 'donator'"
  })
  role?: IUserRole;

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

export class BanUserDTO {
  @IsNumber()
  @Min(1)
  user_id!: number;

  @IsString()
  @MaxLength(100)
  banned_until!: string;

  @IsString()
  @MaxLength(255)
  ban_reason!: string;
}

export class UnbanUserDTO {
  @IsNumber()
  @Min(1)
  user_id!: number;
}
