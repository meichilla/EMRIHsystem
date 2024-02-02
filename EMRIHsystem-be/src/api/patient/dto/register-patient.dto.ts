import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class RegisterPatientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  homeAddress: string;

  @IsNotEmpty()
  @IsString()
  nic: string;

  @IsNotEmpty()
  @IsString()
  dob: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  telephone: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
