export interface ReporteDiarioResponse {
  fecha: string;
  pagos: { [cedula: string]: { [tipoPago: string]: number } };
  totalPorTipoPago: { [tipoPago: string]: number };
  totalPagos:  number;
  montoTotal: number;
  totalPrestamos: number;
  mensaje: string;
}