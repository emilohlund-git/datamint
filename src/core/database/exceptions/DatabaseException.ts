export class DatabaseException extends Error {
  code: number;

  constructor(message?: string, code?: number) {
    super(message);
    this.name = "DatabaseException";
  }
}
