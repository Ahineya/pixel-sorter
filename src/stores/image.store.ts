import {StoreSubject} from "@dgaa/store-subject";
import {
    getPixelBrightness,
    Pixel,
    sortByBrightness,
    sortByHue,
    sortBySaturation,
    sortByValue
} from "../helpers/pixel-sort.ts";

function debounce(func: Function, wait: number, immediate?: boolean) {
    let timeout: number | null;

    return function executedFunction(this: any, ...args: any[]) {
        const context = this;

        const later = function () {
            timeout = null;

            if (!immediate) {
                func.apply(context, args);
            }
        };

        const callNow = immediate && !timeout;

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait) as unknown as number;

        if (callNow) {
            func.apply(context, args);
        }
    };
}

class ImageStore {
    public image = new StoreSubject<HTMLImageElement | null>(null);
    public originalImage = new StoreSubject<HTMLImageElement | null>(null);
    public mask = new StoreSubject<ImageData | null>(null);
    public sortMethod = new StoreSubject('brightness' as 'brightness' | 'hue' | 'saturation' | 'value');

    public lightThreshold = new StoreSubject(0.3);
    public darkThreshold = new StoreSubject(0.7);

    public setImage(image: HTMLImageElement) {

        // Get image data from image
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const maskData = this.createMask(imageData);

        const newImageData = this.sortPixels(imageData, maskData);

        const newImage = new Image();
        // Fill newImage with newImageData
        const newCanvas = document.createElement('canvas');
        newCanvas.width = newImageData.width;
        newCanvas.height = newImageData.height;

        const newCtx = newCanvas.getContext('2d')!;
        newCtx.putImageData(newImageData, 0, 0);

        newImage.onload = () => {
            this.originalImage.next(image);
            this.image.next(newImage);
            this.mask.next(maskData);
        }

        newImage.src = newCanvas.toDataURL();
    }

    private debouncedSetImage = debounce(this.setImage, 100);

    public setLightThreshold = (threshold: number) => {
        this.lightThreshold.next(threshold);
        this.debouncedSetImage(this.originalImage.getValue()!);
    }
    public setDarkThreshold = (threshold: number) => {
        this.darkThreshold.next(threshold);
        this.debouncedSetImage(this.originalImage.getValue()!);
    }

    public setSortMethod(method: 'brightness' | 'hue' | 'saturation' | 'value') {
        this.sortMethod.next(method);

        if (this.originalImage.getValue()) {
            this.setImage(this.originalImage.getValue()!);
        }
    }

    public saveImage() {
        if (!this.image.getValue()) {
            return;
        }

        const image = this.image.getValue()!;

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0);

        const a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = 'pixel-sorted.png';
        a.click();
    }

    private sortPixels(imageData: ImageData, maskData: ImageData): ImageData {
        /*
            We want to sort the pixels in ImageData.
            maskData contains red pixels where we want to sort the pixels.
            We want to find all the sorting ranges in columns of maskData, and sort the pixels in imageData accordingly.
         */

        const mask = maskData.data;
        const image = imageData.data;

        const width = imageData.width;
        const height = imageData.height;

        for (let x = 0; x < width; x++) {
            const ranges = []; // [start, end]
            const currentRange = {start: 0, end: 0};

            for (let y = 0; y < height; y++) {
                const idx = (y * width + x) * 4;

                if (mask[idx] === 255) {
                    currentRange.end = y;
                } else {
                    if (currentRange.end > currentRange.start) {
                        ranges.push({...currentRange});
                    }

                    currentRange.start = y;
                    currentRange.end = y;
                }

                if (y === height - 1 && currentRange.end > currentRange.start) {
                    ranges.push({...currentRange});
                }
            }

            console.log('ranges', ranges);

            ranges.forEach(range => {
                const pixels: Pixel[] = [];

                for (let y = range.start; y <= range.end; y++) {
                    const idx = (y * width + x) * 4;

                    pixels.push({
                        r: image[idx],
                        g: image[idx + 1],
                        b: image[idx + 2],
                    });
                }

                switch (this.sortMethod.getValue()) {
                    case 'brightness':
                        pixels.sort(sortByBrightness);
                        break;
                    case 'hue':
                        pixels.sort(sortByHue);
                        break;
                    case 'saturation':
                        pixels.sort(sortBySaturation);
                        break;
                    case 'value':
                        pixels.sort(sortByValue);
                        break;
                }

                for (let y = range.start; y <= range.end; y++) {
                    const idx = (y * width + x) * 4;

                    image[idx] = pixels[y - range.start].r;
                    image[idx + 1] = pixels[y - range.start].g;
                    image[idx + 2] = pixels[y - range.start].b;
                }
            });
        }


        return imageData;
    }

    private createMask(imageData: ImageData) {
        const maskData = new ImageData(imageData.width, imageData.height);
        const mask = maskData.data;

        for (let i = 0; i < mask.length; i += 4) {
            mask[i] = 0;
            mask[i + 1] = 0;
            mask[i + 2] = 0;
            mask[i + 3] = 255;

            const pixel = {
                r: imageData.data[i],
                g: imageData.data[i + 1],
                b: imageData.data[i + 2],
            };

            const brightness = getPixelBrightness(pixel);

            if (brightness >= this.lightThreshold.getValue() && brightness <= this.darkThreshold.getValue()) {
                mask[i] = 255; // R
            }
        }

        return maskData;
    }
}

export const imageStore = new ImageStore();
