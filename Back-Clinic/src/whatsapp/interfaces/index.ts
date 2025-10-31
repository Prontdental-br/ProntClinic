interface EvolutionInstance {
  instanceName: string;
  instanceId: string;
  status: string;
}

interface EvolutionInstanceData {
  ownerJid: string;
  id: string;
  integration: string;
  name: string;
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

export {
  EvolutionInstance,
  EvolutionQrCode,
  CreateEvolutionInstanceReturn,
  EvolutionInstanceData,
};
