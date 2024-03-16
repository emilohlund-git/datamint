export class DockerException extends Error {
  code: number;

  constructor(message?: string, code?: number) {
    super(message);
    this.name = "DockerException";
    this.code = code || 0;
  }
}
