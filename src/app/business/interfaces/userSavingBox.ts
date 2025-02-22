export interface UserSavingsBox {
  id: number;
  userId: number;
  boxCount: number;
  boxValue: number;
  updatedAt: string; // se puede parsear como Date si lo deseas
}