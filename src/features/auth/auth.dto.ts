import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Length
} from "class-validator";

export class RegisterDto {
  @MinLength(6)
  @MaxLength(50)
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
}

// Strange to require both login and email, but ok. As you wish.
export class LoginDto {
  @IsString()
  login!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  @IsString()
  password!: string;
}

export class PasswordResetRequestDto {
  @IsEmail()
  email!: string;
}

export class PasswordResetDto {
  @IsString()
  confirm_token!: string;

  @MinLength(6)
  @IsString()
  password!: string;

  @MinLength(6)
  @IsString()
  passwordConfirmation!: string;
}

export class LogoutDTO {
  @MinLength(6)
  @MaxLength(100)
  @IsString()
  refreshToken!: string;
}

export class EmailVerificationDto {
  @Length(36, 36)
  @IsString()
  confirm_token!: string;
}
