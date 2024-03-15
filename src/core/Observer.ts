import { DatabaseType } from "src/core/enums";

export abstract class Observer<T> {
  private observers: Observer<T>[] = [];
  protected database: DatabaseType;

  constructor(database: DatabaseType) {
    this.database = database;
  }

  abstract update(info: {
    database: DatabaseType;
    tempDir: string;
  }): Promise<void>;

  public addObserver(observer: Observer<T>) {
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer<T>) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  protected async notifyObservers(info: {
    database: DatabaseType;
    tempDir: string;
  }) {
    for (const observer of this.observers) {
      await observer.update(info);
    }
  }

  protected abstract gracefulShutdown(info: {
    database: DatabaseType;
    tempDir: string;
  }): Promise<void>;
}
