interface EvolutionInstance {
  instanceName: string;
  instanceId: string;
  status: string;
}

interface EvolutionQrCode {
  code: string;
  base64: string;
}

interface CreateEvolutionInstanceReturn {
  instance: EvolutionInstance;
  hash: string;
  qrcode: EvolutionQrCode;
}

interface CreateWhatsapp {
  accountId?: string,
  token: string,
  evolutionInstanceId: string,
  isConnected: boolean,
  evolutionInstanceName: string,
  createdByAdmin: true,
}

export type { EvolutionInstance, EvolutionQrCode, CreateEvolutionInstanceReturn, CreateWhatsapp };
