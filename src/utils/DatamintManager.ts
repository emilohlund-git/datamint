import { Datamint } from "./Datamint";

export class DatamintManager {
  private static instances: any[] = [];

  static addInstance<T>(datamintInstance: Datamint<T>) {
    this.instances.push(datamintInstance);
  }

  static removeInstance<T>(instance: Datamint<T>) {
    const index = this.instances.indexOf(instance);
    if (index > -1) {
      this.instances.splice(index, 1);
    }
  }

  static getInstanceIndex<T>(datamintInstance: Datamint<T>) {
    return this.instances.indexOf(datamintInstance);
  }

  static getInstances<T>(): Datamint<T>[] {
    return this.instances;
  }
}
