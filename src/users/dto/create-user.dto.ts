import { UserRoles } from '../../common/enums/user.enum';

export class CreateUserDto {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRoles;
}
