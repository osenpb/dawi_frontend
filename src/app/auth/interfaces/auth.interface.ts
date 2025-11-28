import { UserResponse } from "./userResponse.interface";

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
  userResponseDTO: UserResponse,
  token: string
}




