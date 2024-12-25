import {rgbToHsv} from "./rgb-to-hsv.ts";

export type Pixel = {
    r: number,
    g: number,
    b: number,
}

export const sortByBrightness = (a: Pixel, b: Pixel) => {
    return (a.r + a.g + a.b) - (b.r + b.g + b.b);
}

export function getPixelBrightness(pixel: Pixel) {
    // const brightness = (pixel.r + pixel.g + pixel.b) / 3; // 0-255
    // return brightness / 255; // 0-1

    const brightness = rgbToHsv(pixel.r, pixel.g, pixel.b).v;
    return brightness;
}

export const sortByHue = (a: Pixel, b: Pixel) => {
    const aHue = rgbToHsv(a.r, a.g, a.b).h;
    const bHue = rgbToHsv(b.r, b.g, b.b).h;

    return aHue - bHue;
}

export const sortBySaturation = (a: Pixel, b: Pixel) => {
    const aSat = rgbToHsv(a.r, a.g, a.b).s;
    const bSat = rgbToHsv(b.r, b.g, b.b).s;

    return aSat - bSat;
}

export const sortByValue = (a: Pixel, b: Pixel) => {
    const aVal = rgbToHsv(a.r, a.g, a.b).v;
    const bVal = rgbToHsv(b.r, b.g, b.b).v;

    return aVal - bVal;
}