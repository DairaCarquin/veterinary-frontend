export interface Environment {
  apiBaseUrl: string;
  /**
   * true  -> usa datos mock en el frontend (no necesita backend ni BD)
   * false -> usa los microservicios reales
   */
  useMockBackend: boolean;
}

export const environment: Environment = {
  // Ajusta esta URL al dominio/puerto de tu API Gateway cuando tengas backend
  apiBaseUrl: 'http://localhost:8080',
  useMockBackend: true,
};
