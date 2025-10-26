import Song from "./Song.js"
import { Decoder, Encoder, MediaInput, MediaOutput } from 'node-av/api';
import { FF_ENCODER_LIBMP3LAME } from 'node-av/constants';
import path from "path";
import { existsSync } from "fs";
import fs from "fs/promises";

const OUTPUT_PATH = path.resolve("../output");

/**
 * Transcodes songs to MP3 using NodeAV
 */
export async function transcodeSongs(songs: Song[]): Promise<Song[]> {
    if (!existsSync(OUTPUT_PATH)) {
        await fs.mkdir(OUTPUT_PATH);
    }

    await deleteAllFilesInDirectory(OUTPUT_PATH);

    const outputSongs = songs.map(song => {
        return transcode(song);
    });

    return Promise.all(outputSongs);
}

async function transcode(song: Song): Promise<Song> {
    const outputFilePath = path.join(OUTPUT_PATH, `${song.filename.noExtension}.mp3`);

    // exit if file is already mp3
    if (song.filename.full?.split(".")[1] === "mp3") return song;

    await using input = await MediaInput.open(song.dir);
    await using output = await MediaOutput.open(outputFilePath);

    // Get audio stream
    const audioStream = input.audio()!;

    // Create decoder
    using decoder = await Decoder.create(audioStream);

    // Create encoder
    using encoder = await Encoder.create(FF_ENCODER_LIBMP3LAME, {
        timeBase: audioStream.timeBase,
        bitrate: "192k"
    })

    // Add stream to output
    const outputIndex = output.addStream(encoder);

    // process packets
    for await (using packet of input.packets(audioStream.index)) {
        using frame = await decoder.decode(packet);
        if (frame) {
            using encoded = await encoder.encode(frame);
            if (encoded) {
                await output.writePacket(encoded, outputIndex);
            }
        }
    }

    // Flush decoder
    for await (using frame of decoder.flushFrames()) {
        using encoded = await encoder.encode(frame);
        if (encoded) {
            await output.writePacket(encoded, outputIndex);
        }
    }

    // Flush encoder
    for await (using packet of encoder.flushPackets()) {
        await output.writePacket(packet, outputIndex);
    }

    return Song.create(outputFilePath);
}

async function deleteAllFilesInDirectory(dir: string): Promise<void> {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        await fs.unlink(filePath);
    }
}