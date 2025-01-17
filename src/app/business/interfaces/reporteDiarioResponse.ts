export interface ReporteDiarioResponse {
  fecha: string;
  pagos: { [cedula: string]: { [tipoPago: string]: number } };
  totalPorTipoPago: { [tipoPago: string]: number };
  montoTotal: number;
  mensaje: string;
}