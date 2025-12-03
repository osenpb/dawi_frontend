import { Role } from "./role.interface"


export type UserResponse = {
  id: number,
  username: string,
  email: string,
  role: Role,
  telefono?: string
}

