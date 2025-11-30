export class CreatePersonService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const config = getConfig();
    this.baseUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  async handle(name: string, phoneNumber: string): Promise<CreatePersonResponse> {
    if (!name) {
      throw new Error('Nome não pode ser vazio');
    }

    if (!phoneNumber) {
      throw new Error('Número de telefone não pode ser vazio');
    }

    const response = await httpRequest(`${this.baseUrl}/people`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/Agendor',
      },
      body: JSON.stringify({
        name,
        contact: {
          whatsapp: phoneNumber,
        },
      }),
    });

    return {
      success: true,
      data: response.data,
    };
  }
}