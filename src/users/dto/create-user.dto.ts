export class CreateUserDto {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly full_name: string;
  readonly phone_number: string;
  readonly birthdate: string;
  readonly role_id: string;
}
