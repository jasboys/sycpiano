import { parse } from 'date-fns';
import ExifReader from 'exifreader';
import { resolve } from 'node:path';
import Sharp from 'sharp';
import smartcrop from 'smartcrop-sharp';

const getImagePath = (fileName: string) =>
    resolve(process.env.IMAGE_ASSETS_DIR, 'gallery', fileName);

export const getDateTaken = async (fileName: string) => {
    try {
        const imageFile = getImagePath(fileName);
        const tags = await ExifReader.load(imageFile);
        const dateTaken = tags.DateTimeOriginal?.value as string[] | undefined;
        if (dateTaken?.length) {
            try {
                const parsed = parse(
                    dateTaken[0],
                    'yyyy:MM:dd HH:mm:ss',
                    new Date(),
                );
                return parsed;
            } catch (e) {
                return undefined;
            }
        }
        return;
    } catch (e) {
        console.log(e);
    }
};

export const genThumbnail = async (fileName: string) => {
    try {
        const imageFile = getImagePath(fileName);
        const sharpImage = Sharp(imageFile);
        const metadata = await sharpImage.metadata();
        const dateTaken = await getDateTaken(fileName);

        const newWidth = metadata.width;
        if (!newWidth) {
            throw Error('could not get width of image');
        }
        const newHeight = Math.round((newWidth * 2) / 3);
        const { topCrop } = await smartcrop.crop(imageFile, {
            minScale: 1.0,
            width: newWidth,
            height: newHeight,
        });
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
        return {
            original: {
                width: metadata.width,
                height: metadata.height,
            },
            thumbnail: {
                width: output.width,
                height: output.height,
            },
            dateTaken,
        };
    } catch (e) {
        console.log(e);
    }
};
