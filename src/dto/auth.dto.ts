import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Length
} from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  login!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  passwordConfirmation!: string;

  @IsEmail()
  email!: string;
}

export class LoginDto {
  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class PasswordResetRequestDto {
  @IsEmail()
  email!: string;
}

export class PasswordResetDto {
  @IsString()
  confirm_token!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(6)
  passwordConfirmation!: string;
}

export class LogoutDTO {
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  refreshToken!: string;
}

export class EmailVerificationDto {
  @IsString()
  @Length(36, 36)
  confirm_token!: string;
}
