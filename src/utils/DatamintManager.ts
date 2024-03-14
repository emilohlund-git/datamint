import { Datamint } from "./Datamint";

export class DatamintManager {
  private static instances: Datamint[] = [];

  static addInstance(datamintInstance: Datamint) {
    this.instances.push(datamintInstance);
  }

  static removeInstance(instance: Datamint) {
    const index = this.instances.indexOf(instance);
    if (index > -1) {
      this.instances.splice(index, 1);
    }
  }

  static getInstanceIndex(datamintInstance: Datamint) {
    return this.instances.indexOf(datamintInstance);
  }

  static getInstances(): Datamint[] {
    return this.instances;
  }
}
