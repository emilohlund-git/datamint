import { LogStyle } from "../enums/LogStyle";
import { LogColor } from "../enums/LogColor";
import { BackgroundColor } from "../enums/BackgroundColor";
import { Emoji } from "../enums/Emoji";
import { Spinners } from "../constants/Spinners";

export enum Verbosity {
  NONE,
  ERROR,
  WARNING,
  INFO,
  DEBUG,
}

export class LoggerService {
  static verbosity: Verbosity = Verbosity.NONE;
  static color?: LogColor;
  static context?: string = "Datamint";
  static emojis?: boolean = true;
  static styles?: boolean = true;

  static info(
    message: string,
    emoji: Emoji,
    color: LogColor = LogColor.CYAN,
    style: LogStyle = LogStyle.BRIGHT,
    background?: BackgroundColor
  ) {
    this.log(message, emoji, color, style, Verbosity.INFO, background);
  }

  static success(
    message: string,
    emoji: Emoji = Emoji.SUCCESS,
    color: LogColor = LogColor.GREEN,
    style: LogStyle = LogStyle.BRIGHT,
    background?: BackgroundColor
  ) {
    this.log(message, emoji, color, style, Verbosity.INFO, background);
  }

  static warning(
    message: string,
    emoji: Emoji = Emoji.WARNING,
    color: LogColor = LogColor.YELLOW,
    style: LogStyle = LogStyle.BRIGHT,
    background?: BackgroundColor,
    overwrite?: boolean
  ) {
    if (overwrite) {
      this.logOverwrite(
        message,
        emoji,
        color,
        style,
        Verbosity.WARNING,
        background
      );
      return;
    }
    this.log(message, emoji, color, style, Verbosity.WARNING, background);
  }

  static error(
    message: string,
    error?: Error,
    emoji: Emoji = Emoji.ERROR,
    background?: BackgroundColor
  ) {
    this.log(
      message,
      emoji,
      LogColor.RED,
      LogStyle.BRIGHT,
      Verbosity.ERROR,
      background
    );
    if (error && this.verbosity >= Verbosity.ERROR) {
      console.log(error);
    }
  }

  static spinner(
    message: string,
    style: LogStyle,
    color?: LogColor,
    spinners?: string[],
    interval?: number
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

  private static log(
    message: string,
    emoji: Emoji,
    color: LogColor,
    style: LogStyle,
    verbosity: Verbosity,
    background?: BackgroundColor
  ) {
    if (this.verbosity < verbosity) return;

    const timestamp = new Date().toISOString();
    const level = Verbosity[verbosity];

    color = this.color || color;
    message = this.emojis ? `${emoji} ${message}` : message;
    message = this.context ? `[${this.context}] - ${message}` : message;
    const styles = this.styles ? `${style}${color}${background ?? ""}` : "";

    const logMessage = `\r${styles}[${timestamp}] - [${level}] - ${message}${LogStyle.RESET}`;
    console.log(logMessage);
  }

  private static logOverwrite(
    message: string,
    emoji: Emoji,
    color: LogColor,
    style: LogStyle,
    verbosity: Verbosity,
    background?: BackgroundColor
  ) {
    if (this.verbosity < verbosity) return;

    const timestamp = new Date().toISOString();
    const level = Verbosity[verbosity];

    color = this.color || color;
    message = this.emojis ? `${emoji} ${message}` : message;
    message = this.context ? `[${this.context}] - ${message}` : message;
    const styles = this.styles ? `${style}${color}${background ?? ""}` : "";

    const logMessage = `\r${styles}[${timestamp}] - [${level}] - ${message}${LogStyle.RESET}`;
    process.stdout.write(logMessage);
  }
}
