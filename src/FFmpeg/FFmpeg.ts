import { spawn } from "child_process";
import { existsSync } from "fs";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = path.resolve(path.join(__dirname, "../output"));


export function convert(inputFile: string, outputFile: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!existsSync(inputFile)) {
            throw new Error("inputFile directory path is incorrect.");
        }

        const args: string[] = [
            "-loglevel", "error",
            "-i", inputFile,
            "-vn",
            "-acodec", "libmp3lame",
            "-qscale:a", "2",
            outputFile
        ]

        const ffmpeg = spawn("ffmpeg", args, {
            cwd: __dirname
        });

        ffmpeg.stderr.on("data", err => {
            throw new Error(`FFmpeg child process threw an error: ${err}\nFile path:\n  Input: ${inputFile}\n   Output: ${outputFile}`);
        });

        ffmpeg.on("close", code => {
            if (code === 0) {
                resolve(outputFile);
            } else {
                throw new Error(`FFmpeg exited with code: ${code}`);
            }
        })

        ffmpeg.on("error", err => {
            throw new Error(`FFmpeg child process failed to start: ${err}`);
        })
    })
}
