import { DatabaseException } from "../database/exceptions";
import { DockerException } from "../docker/exceptions";

export const ensureDockerException = (value: unknown): DockerException => {
  if (value instanceof DockerException) return value;

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {}

  const error = new DockerException(
    `This value was thrown as is, not through an Error: ${stringified}`
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
    `This value was thrown as is, not through an Error: ${stringified}`
  );
  return error;
};
