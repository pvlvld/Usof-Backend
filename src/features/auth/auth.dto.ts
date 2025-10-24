import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Length,
  ValidateIf,
  IsNotEmpty,
  IsEmpty
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

  // Removed since it's purely UX and frontend should handle it.
  // // https://github.com/typestack/class-validator/issues/486
  // @ValidateIf((o) => o.password !== o.passwordConfirmation)
  // @IsNotEmpty()
  // @IsEmpty({ message: "passwordConfirmation must match password" })
  // passwordConfirmation!: string;

  @IsEmail()
  email!: string;
}

// Strange to require both login and email, but ok. As you wish.
export class LoginDto {
  @IsString()
  login!: string;

  @IsEmail()
  email!: string;

  @MaxLength(100)
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

  @MaxLength(100)
  @MinLength(6)
  @IsString()
  password!: string;

  // Removed since it's purely UX and frontend should handle it.
  // // https://github.com/typestack/class-validator/issues/486
  // @ValidateIf((o) => o.password !== o.passwordConfirmation)
  // @IsNotEmpty()
  // @IsEmpty({ message: "passwordConfirmation must match password" })
  // passwordConfirmation!: string;
}

export class LogoutDTO {
  @MinLength(6)
  @MaxLength(100)
  @IsString()
  refreshToken!: string;
}

export class EmailVerificationDto {
  @Length(32, 64)
  @IsString()
  confirm_token!: string;
}
