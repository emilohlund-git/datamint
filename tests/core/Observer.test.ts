import { Observer } from "@datamint/core/Observer";
import { DatabaseType } from "@datamint/core/enums";

class TestObserver extends Observer<number> {
  async update(): Promise<void> {
    // Implementation for testing
  }
}

describe("Observer", () => {
  let database: DatabaseType;
  let observer: TestObserver;
  let otherObserver: TestObserver;

  beforeEach(() => {
    database = DatabaseType.MYSQL;
    observer = new TestObserver(database);
    otherObserver = new TestObserver(database);
  });

  it("should add an observer", () => {
    observer.addObserver(otherObserver);
    expect((observer as any).observers).toContain(otherObserver);
  });

  it("should remove an observer", () => {
    observer.addObserver(otherObserver);
    observer.removeObserver(otherObserver);
    expect((observer as any).observers).not.toContain(otherObserver);
  });

  it("should notify observers", async () => {
    const updateSpy = jest.spyOn(otherObserver, "update");
    observer.addObserver(otherObserver);
    await (observer as any).notifyObservers();
    expect(updateSpy).toHaveBeenCalled();
  });
});
