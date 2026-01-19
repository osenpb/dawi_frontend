import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { ReservaResponse } from '../interfaces/reserva/reserva.interface';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  private formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  private getHabitacionInfo(habitacionId: number, hotel: ReservaResponse['hotel']): { numero: string; tipo: string; precio: number } {
    if (!hotel?.habitaciones) {
      return { numero: habitacionId.toString(), tipo: 'Standard', precio: 0 };
    }

    const habitacion = hotel.habitaciones.find((h: any) => h.id === habitacionId);
    if (!habitacion) {
      return { numero: habitacionId.toString(), tipo: 'Standard', precio: 0 };
    }

    return {
      numero: habitacion.numero,
      tipo: habitacion.tipoHabitacion?.nombre || 'Standard',
      precio: habitacion.precio
    };
  }

  private calcularSubtotalPorNoche(reserva: ReservaResponse): number {
    if (!reserva?.detalles) return 0;
    return reserva.detalles.reduce((sum: number, detalle: any) => sum + detalle.precioNoche, 0);
  }

  private calcularNoches(reserva: ReservaResponse): number {
    if (!reserva) return 0;

    const inicio = new Date(reserva.fechaInicio);
    const fin = new Date(reserva.fechaFin);
    const diff = fin.getTime() - inicio.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  descargarPDF(reserva: ReservaResponse): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Paleta de colores Ayni
    const colorDark: [number, number, number] = [2, 6, 23];    // slate-950
    const colorAmber: [number, number, number] = [245, 158, 11]; // amber-500
    const colorGray: [number, number, number] = [100, 116, 139]; // slate-500
    const colorText: [number, number, number] = [30, 41, 59];   // slate-800

    let y = 0;

    // --- HEADER ---
    doc.setFillColor(...colorDark);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Logo AYNI
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('AYNI', 20, 25);

    // Registro de marca (R)
    doc.setFontSize(10);
    doc.setTextColor(...colorAmber);
    doc.text('®', 46, 18);

    // Título del documento
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('COMPROBANTE DE RESERVA', pageWidth - 20, 25, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`ID Transacción: ${reserva.id.toString().padStart(8, '0')}`, pageWidth - 20, 32, { align: 'right' });

    // --- INFO BAR ---
    y = 65;
    doc.setTextColor(...colorText);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA DE EMISIÓN:', 20, y);

    doc.setFont('helvetica', 'normal');
    const fechaActual = new Date().toLocaleString('es-PE');
    doc.text(fechaActual, 60, y);

    // --- SECCIONES PRINCIPALES ---
    y += 15;

    // Línea decorativa Ámbar
    doc.setDrawColor(...colorAmber);
    doc.setLineWidth(1);
    doc.line(20, y, 40, y);
    y += 10;

    // Grid de Datos (Hotel y Cliente)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colorDark);
    doc.text('DETALLES DEL ESTABLECIMIENTO', 20, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    y += 6;
    doc.text(`Hotel: ${reserva.hotel?.nombre || 'N/A'}`, 20, y);
    y += 5;
    doc.text(`Dirección: ${reserva.hotel?.direccion || 'N/A'}`, 20, y);

    // Columna Derecha: Cliente
    let yTemp = y - 11;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DATOS DEL HUÉSPED', pageWidth / 2 + 10, yTemp);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    yTemp += 6;
    const clienteNombre = reserva.cliente ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}`.trim() || 'N/A' : 'N/A';
    doc.text(`Titular: ${clienteNombre}`, pageWidth / 2 + 10, yTemp);
    yTemp += 5;
    doc.text(`Documento: ${reserva.cliente?.documento || 'N/A'}`, pageWidth / 2 + 10, yTemp);
    yTemp += 5;
    doc.text(`Email: ${reserva.cliente?.email || 'N/A'}`, pageWidth / 2 + 10, yTemp);

    y = yTemp + 15;

    // --- DETALLES DE ESTADÍA ---
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(20, y, pageWidth - 40, 20, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text('CHECK-IN', 30, y + 8);
    doc.text('CHECK-OUT', pageWidth / 2 - 10, y + 8);
    doc.text('NOCHES', pageWidth - 50, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorAmber);
    doc.text(reserva.fechaInicio, 30, y + 14);
    doc.text(reserva.fechaFin, pageWidth / 2 - 10, y + 14);
    doc.text(this.calcularNoches(reserva).toString(), pageWidth - 50, y + 14);

    y += 35;

    // --- TABLA DE HABITACIONES ---
    doc.setTextColor(...colorDark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('HABITACIONES RESERVADAS', 20, y);
    y += 8;

    // Header Tabla
    doc.setFillColor(...colorDark);
    doc.rect(20, y, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Descripción', 25, y + 5.5);
    doc.text('Tipo', 80, y + 5.5);
    doc.text('Precio Unit.', pageWidth - 30, y + 5.5, { align: 'right' });

    y += 15;
    doc.setTextColor(...colorText);
    let subtotal = 0;

    if (reserva.detalles?.length) {
      reserva.detalles.forEach((detalle: any) => {
        const habInfo = this.getHabitacionInfo(detalle.habitacionId, reserva.hotel);
        doc.text(`Habitación N° ${habInfo.numero}`, 25, y);
        doc.text(habInfo.tipo, 80, y);
        doc.text(this.formatCurrency(detalle.precioNoche), pageWidth - 30, y, { align: 'right' });
        subtotal += detalle.precioNoche;
        y += 8;
      });
    }

    // --- TOTALES ---
    y += 10;
    doc.setDrawColor(230, 230, 230);
    doc.line(pageWidth - 90, y, pageWidth - 20, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal por noche:', pageWidth - 90, y);
    doc.text(this.formatCurrency(subtotal), pageWidth - 20, y, { align: 'right' });

    y += 6;
    const noches = this.calcularNoches(reserva);
    doc.text(`Multiplicado por ${noches} noches:`, pageWidth - 90, y);
    doc.text(this.formatCurrency(subtotal * noches), pageWidth - 20, y, { align: 'right' });

    y += 10;
    doc.setFillColor(...colorAmber);
    doc.rect(pageWidth - 90, y - 6, 70, 12, 'F');
    doc.setTextColor(...colorDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL FINAL', pageWidth - 85, y + 1.5);
    doc.text(this.formatCurrency(reserva.total), pageWidth - 25, y + 1.5, { align: 'right' });

    // --- PIE DE PÁGINA ---
    const footerY = doc.internal.pageSize.getHeight() - 30;

    doc.setDrawColor(...colorAmber);
    doc.setLineWidth(0.5);
    doc.rect(20, footerY - 10, 40, 15);
    doc.setTextColor(...colorAmber);
    doc.setFontSize(10);
    doc.text('PAGADO', 40, footerY, { align: 'center' });

    doc.setTextColor(...colorGray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const notas = [
      '* Presente su DNI físico al momento de ingresar.',
      '* Check-in: 14:00 | Check-out: 12:00.',
      '* La reciprocidad es la base de nuestra cultura. ¡Disfrute su estadía!'
    ];
    notas.forEach((nota, i) => doc.text(nota, 70, footerY - 5 + (i * 4)));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('AYNI RESERVAS PERÚ S.A.C - RUC 20600000000', pageWidth / 2, footerY + 20, { align: 'center' });

    doc.save(`Ayni_Reserva_${reserva.id}.pdf`);
  }
}