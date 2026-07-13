export interface LubricantStockMovement {
  id: number;
  movementDate: string;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string | null;
}
