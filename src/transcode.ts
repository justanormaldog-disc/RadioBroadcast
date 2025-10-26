import Song from "./Song.js"
import { Decoder, Encoder, MediaInput, MediaOutput } from 'node-av/api';
import { FF_ENCODER_MP3_MF } from 'node-av/constants';
import path from "path";
import { existsSync } from "fs";
import fs from "fs/promises";

const OUTPUT_PATH = path.resolve("../output");

/**
 * Transcodes songs to MP3 using NodeAV
 */
export async function transcodeSongs(songs: Song[]) {
    if (!existsSync(OUTPUT_PATH)) {
        await fs.mkdir(OUTPUT_PATH);
    }

    await deleteAllFilesInDirectory(OUTPUT_PATH);

    songs.map(async song => {
        return await transcode(song);
    })
}

async function transcode(song: Song) {
    await using input = await MediaInput.open(song.dir);
    await using output = await MediaOutput.open(path.join(OUTPUT_PATH, `${song.filename.noExtension}.mp3`));

    // Get audio stream
    const audioStream = input.audio()!;

    // Create decoder
    using decoder = await Decoder.create(audioStream);

    // Create encoder
    using encoder = await Encoder.create(FF_ENCODER_MP3_MF, {
        timeBase: audioStream.timeBase,
        bitrate: "192k"
    })

    // Add stream to ouput
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
}

async function deleteAllFilesInDirectory(dir: string) {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        await fs.unlink(filePath);
    }
}