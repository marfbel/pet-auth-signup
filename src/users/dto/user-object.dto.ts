// DTO for user object returned from database
export class UserObjectDto {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}
