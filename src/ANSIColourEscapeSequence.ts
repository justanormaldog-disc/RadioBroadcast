export enum ColourCodes {
    YELLOW = 11,
    RED = 9,
    BLACK = 16,
    LIGHT_BLACK = 0,
    WHITE = 255,
}

const reset = () => "\x1b[0m";
export const prevline = () => "\x1b[#F";
export const eraseline = () => "\x1b[2K";

export const foreground = (str: string, code: ColourCodes): string => {
    return `\x1b[38;5;${code}m${str}${reset()}`;
}

export const background = (str: string, code: ColourCodes): string => {
    return `\x1b[48;5;${code}m${str}${reset()}`;
}