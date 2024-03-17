import { DatabaseException } from "../database/exceptions";
import { DockerException } from "../docker/exceptions";

export const ensureDockerException = (value: unknown): DockerException => {
  if (value instanceof DockerException) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new DockerException(
    `${stringified}`
  );
  return error;
};

export const ensureDatabaseException = (value: unknown): DatabaseException => {
  if (value instanceof DatabaseException) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new DatabaseException(
    `${stringified}`
  );
  return error;
};
