import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEmpty,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf
} from "class-validator";
import type { IUserModel } from "./user.model.js";

export type IUserRole = "user" | "admin" | "donator" | "moderator";

export class UserIdDTO {
  @Min(1)
  @IsInt()
  user_id!: number;
}

export class GetUsersDto {
  @Min(1)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page: number = 1;

  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit: number = 10;
}

export class GetUserByIdDTO {
  @Min(1)
  @Type(() => Number)
  @IsInt()
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

  // https://github.com/typestack/class-validator/issues/486
  @ValidateIf((o) => o.password !== o.passwordConfirmation)
  @IsNotEmpty()
  @IsEmpty({ message: "passwordConfirmation must match password" })
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
  @IsInt()
  user_id!: number;

  @MaxLength(100)
  @IsString()
  avatar!: string;
}

class UserDTO implements IUserModel {
  id!: number;
  login!: string;
  password_hash!: string;
  password_salt!: string;
  full_name!: string;
  email!: string;
  email_verified!: boolean;
  avatar!: string;
  rating!: number;
  role!: IUserRole;

  created_at!: Date;
  updated_at!: Date;
  banned_until!: Date | null;
  ban_reason!: string | null;
  deleted_at!: Date | null;
}

export class UpdateUserDataDTO {
  @Min(1)
  @Type(() => Number)
  @IsInt()
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
  @IsOptional()
  password!: string;

  // https://github.com/typestack/class-validator/issues/486
  @ValidateIf((o) => o.password !== o.passwordConfirmation)
  @IsNotEmpty()
  @IsEmpty({ message: "passwordConfirmation must match password" })
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

  @IsInt()
  @IsOptional()
  rating?: number;

  @MaxLength(100)
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  banned_until?: Date | null;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  ban_reason?: string | null;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deleted_at?: Date | null;
}

export class DeleteUserDTO {
  @Min(1)
  @IsInt()
  user_id!: number;
}

export class BanUserDTO {
  @Min(1)
  @IsInt()
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
  @IsInt()
  user_id!: number;
}
