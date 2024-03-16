export const ERROR_MESSAGES: { [key: number]: string } = {
  0: `Container stopped - no tasks left to perform.`,
  1: `Docker daemon not running or container already exists.`,
  137: `Container terminated - manual stop or out of memory.`,
  139: `Container error - possible bug in the application.`,
  143: `Container stopped - it received a termination signal.`,
};

export const MONGODB_DOCKER_EXTENSION = "-mongodb-datamint-1";
export const POSTGRESQL_DOCKER_EXTENSION = "-postgres-datamint-1";
export const MYSQL_DOCKER_EXTENSION = "-mysql-datamint-1";