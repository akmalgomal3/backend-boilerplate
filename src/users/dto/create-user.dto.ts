export class CreateUserDto {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
  readonly phoneNumber: string;
  readonly birthdate: string;
  readonly roleId?: string;
}
