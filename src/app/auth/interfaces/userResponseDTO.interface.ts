import { Role } from "./role.interface"


export type UserResponseDTO = {
  id: number,
  username: string,
  email: string,
  role: Role

}

