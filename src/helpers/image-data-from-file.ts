export function imageDataFromFile(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, img.width, img.height);

                resolve(imageData);
            }

            img.onerror = (e) => {
                reject(e);
            }

            img.src = reader.result as string;

        }

        reader.onerror = () => {
            reject(reader.error);
        }

        reader.readAsDataURL(file);
    });
}

export function imageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {

            const img = new Image();
            img.onload = () => {
                resolve(img);
            }

            img.onerror = (e) => {
                reject(e);
            }

            img.src = reader.result as string;

        }

        reader.onerror = () => {
            reject(reader.error);
        }

        reader.readAsDataURL(file);
    });
}
