interface WebhookData {
  instance: string;
  state: string;
}

export class EvolutionWebhookDTO {
  event: string;
  instance: string;
  data: WebhookData;
  sender: string;
}
