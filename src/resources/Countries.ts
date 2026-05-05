import type { Client } from '../Client';

export class Countries {
  constructor(private client: Client) {}

  public async getAvailable(): Promise<string[]> {
    const response = await this.client.request<{ data: string[] }>('v1/countries');
    return response.data || [];
  }
}
