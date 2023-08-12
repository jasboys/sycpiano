import { resolve } from 'path';
import Sharp from 'sharp';
import smartcrop from 'smartcrop-sharp';

export const genThumbnail = async (fileName: string) => {
    try {
        const imageFile = resolve(
            process.env.IMAGE_ASSETS_DIR,
            'gallery',
            fileName,
        );
        const sharpImage = Sharp(imageFile);
        const metadata = await sharpImage.metadata();
        const newWidth = metadata.width;
        if (!newWidth) {
            throw Error('could not get width of image');
        }
        const newHeight = Math.round((newWidth * 2) / 3);
        console.log(newHeight);
        const { topCrop } = await smartcrop.crop(imageFile, {
            minScale: 1.0,
            width: newWidth,
            height: newHeight,
        });
        console.log(topCrop);
        const output = await sharpImage
            .extract({
                left: topCrop.x,
                top: topCrop.y,
                width: newWidth,
                height: newHeight,
            })
            .resize({ width: 600 })
            .toFile(
                resolve(
                    process.env.IMAGE_ASSETS_DIR,
                    'gallery',
                    'thumbnails',
                    fileName,
                ),
            );
        console.log(output);
        return {
            original: {
                width: metadata.width,
                height: metadata.height,
            },
            thumbnail: {
                width: output.width,
                height: output.height,
            },
        };
    } catch (e) {
        console.log(e);
    }
};
