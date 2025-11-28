

export interface HabitacionRequest {
        numero: string;
        estado: "DISPONIBLE" | "OCUPADA" | "MANTENIMIENTO";
        precio: number;
        tipoHabitacionId:number | null

}


