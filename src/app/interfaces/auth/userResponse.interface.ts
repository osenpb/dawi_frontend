import { Role } from "./role.interface"


export type UserResponse = {
  id: number,
  username: string,
  email: string,
  nombre: string,
  apellido: string,
  telefono?: string,
  dni: string,
  role: Role,
}

