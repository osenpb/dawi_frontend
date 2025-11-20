
export type RegisterRequest = {
  username: string | null;
  email: string | null;
  password: string | null;
  telefono: string | null;

}

export type LoginRequest = {
  email: string | null;
  password: string | null;
}

export type AuthResponse = {
  user: UserResponseDTO,
  token: string
}


export type UserResponseDTO = {
  id: number,
  username: string,
  email: string,
  role: Role

}

export type Role = {
  roleId: number,
  name: string
}
