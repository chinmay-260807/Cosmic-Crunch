
export interface Fortune {
  text: string;
  category: string;
  luckScore: number;
}

export enum AppState {
  IDLE = 'IDLE',
  CRACKING = 'CRACKING',
  REVEALED = 'REVEALED',
  LOADING = 'LOADING'
}
