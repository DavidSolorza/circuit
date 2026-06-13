export type WireConnectFailure =
  | 'missing-terminal'
  | 'same-terminal'
  | 'duplicate'
  | 'same-component';

export type WireConnectResult = { ok: true } | { ok: false; reason: WireConnectFailure };

const MESSAGES: Record<WireConnectFailure, string> = {
  'missing-terminal': 'No se encontraron los terminales. Intenta de nuevo.',
  'same-terminal': 'No puedes conectar un terminal consigo mismo.',
  duplicate:
    'Ya hay un cable entre esos puntos. Busca la línea gris entre componentes o revisa el contador de cables abajo. Selecciónala y pulsa Supr para borrarla.',
  'same-component': 'Conecta terminales de componentes distintos.',
};

export function wireConnectMessage(reason: WireConnectFailure): string {
  return MESSAGES[reason];
}
