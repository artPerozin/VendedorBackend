class MessageHistoryVO {
  constructor(private readonly value: string) {
    if (!/^\d+$/.test(value)) throw new Error("Phone inválido");
  }

  get number() {
    return this.value;
  }
}