import fs from "fs";
import path from "path";

class Logger {
  private readonly appStart: Date;
  private readonly filePath = path.join(process.cwd(), "log.txt");
  constructor() {
    this.appStart = new Date();

    this.log(`Project start`);
  }

  /**
   *
   */
  private async writeInto(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.appendFile(this.filePath, message + "\n", (err) => {
        if (err) {
          console.error("Error appending to file:", err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   *
   */
  public log(message: string): void {
    const _now = new Date();
    const finalMSG = `${_now} ${message}`;
    this.writeInto(finalMSG);
    console.log(finalMSG);
  }
}

export const logger = new Logger();
