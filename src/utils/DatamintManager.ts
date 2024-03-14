import { DatabasePlugin } from "src/plugins";
import { Datamint } from "./Datamint";

export class DatamintManager {
  private static instances: Datamint<DatabasePlugin>[] = [];

  static addInstance<T extends DatabasePlugin>(datamintInstance: Datamint<T>) {
    this.instances.push(datamintInstance);
  }

  static removeInstance<T extends DatabasePlugin>(instance: Datamint<T>) {
    const index = this.instances.indexOf(instance);
    if (index > -1) {
      this.instances.splice(index, 1);
    }
  }

  static getInstanceIndex<T extends DatabasePlugin>(
    datamintInstance: Datamint<T>
  ) {
    return this.instances.indexOf(datamintInstance);
  }

  static getInstances(): Datamint<DatabasePlugin>[] {
    return this.instances;
  }
}
