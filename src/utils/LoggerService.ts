import { LogStyle } from "../utils/enums/LogStyle";
import { LogColor } from "../utils/enums/LogColor";
import { BackgroundColor } from "../utils/enums/BackgroundColor";
import { Emoji } from "../utils/enums/Emoji";
import { Spinners } from "../utils/constants/Spinners";

export class LoggerService {
  static info(
    message: string,
    color: LogColor,
    style: LogStyle,
    emoji: string,
    background?: BackgroundColor
  ) {
    const styles = `${style}${color}${background ?? ""}`;
    const logMessage = `\r${styles}${emoji} ${message}${LogStyle.RESET}`;
    console.log(logMessage);
  }

  static warning(
    message: string,
    color: LogColor,
    style: LogStyle,
    emoji: Emoji = Emoji.WARNING,
    background?: BackgroundColor
  ) {
    const styles = `${style}${color}${background ?? ""}`;
    const logMessage = `\r${styles}${emoji}  ${message}${LogStyle.RESET}`;
    console.log(logMessage);
  }

  static error(
    message: string,
    error?: Error,
    emoji: Emoji = Emoji.ERROR,
    background?: BackgroundColor
  ) {
    const styles = `${LogStyle.BRIGHT}${background ?? ""}${LogColor.RED}`;
    const logMessage = `\n${styles}${emoji} ${message}${LogStyle.RESET}`;
    console.log(logMessage, error ?? "");
  }

  static spinner(
    message: string,
    style: LogStyle,
    color?: LogColor,
    spinners?: string[],
    interval?: number,
  ) {
    const spinner = spinners ?? Spinners.CONNECTING;
    let spinnerIndex = 0;

    const spinnerInterval = setInterval(() => {
      process.stdout.write(
        `\r${style}${LogColor.WHITE}${spinner[spinnerIndex]}${color}${message}${LogStyle.RESET}`
      );
      spinnerIndex = (spinnerIndex + 1) % spinner.length;
    }, interval ?? 100);

    return () => {
      clearInterval(spinnerInterval);
      process.stdout.write("\x1b[2K\x1b[0G");
    };
  }
}
