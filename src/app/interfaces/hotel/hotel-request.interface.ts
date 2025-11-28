import { HabitacionRequest } from "../habitacion/habitacion-request.interface";

export type HotelRequest = {
    nombre: string;
    direccion: string;
    departamentoId: number;
    habitaciones: HabitacionRequest[] | null;
}
