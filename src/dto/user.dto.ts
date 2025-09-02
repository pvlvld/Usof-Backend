import {
  IsNumber,
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

export class UpdatePasswordDto {
  @IsNumber()
  id!: number;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  confirmPassword!: string;
}
