import { Datamint } from "./Datamint";

export class DatamintManager {
  private static instances: any[] = [];

  static addInstance<T, U>(datamintInstance: Datamint<T, U>) {
    this.instances.push(datamintInstance);
  }

  static removeInstance<T, U>(instance: Datamint<T, U>) {
    const index = this.instances.indexOf(instance);
    if (index > -1) {
      this.instances.splice(index, 1);
    }
  }

  static getInstanceIndex<T, U>(datamintInstance: Datamint<T, U>) {
    return this.instances.indexOf(datamintInstance);
  }

  static getInstances<T, U>(): Datamint<T, U>[] {
    return this.instances;
  }
}
