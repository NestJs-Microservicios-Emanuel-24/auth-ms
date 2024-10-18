import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterUserDto {

  @IsString()
  name:string
  @IsString()
  @IsEmail()
  email:string
  @IsString()
  @IsStrongPassword()
  password: string;
}
