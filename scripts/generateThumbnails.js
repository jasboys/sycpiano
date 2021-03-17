const Promise = require('bluebird');
const glob = require('glob');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const path = require('path');
const smartcrop = require('smartcrop-gm');
const ocv = require('opencv');
// const cascade = require('opencv/data/haarcascade_frontalface_alt_tree.xml');

const xmlPath = path.join(__dirname, '../../../../node_modules/opencv/data/haarcascade_frontalface_alt_tree.xml');

const faceDetect = (input) => {
    return new Promise((res, rej) => {
        input.detectObject(xmlPath, { scaleFactor: 1.05, minNeighbors: 0 }, (err, faces) => {
            if (err) return rej(err);
            const boost = faces.map((face) => ({
                x: face.x,
                y: face.y,
                width: face.width,
                height: face.height,
                weight: 1.0,
            }));
            res(boost);
        });
    });
}

function main(directory = __dirname) {
    const out = [];
    glob(path.resolve(directory, './*.jpg'), async (err, files) => {
        await Promise.all(files.map(async (file) => {
            await new Promise(async (resolve, reject) => {
                const outObj = {};
                const pathObject = path.parse(file);
                const outPath = path.join(pathObject.dir, 'thumbnails', pathObject.base);
                outObj.file = pathObject.base;

                const { width, height } = await new Promise((res, rej) => {
                    gm(file).size((err, values) => {
                        if (err) {
                            console.log(err);
                            rej(err);
                        } else {
                            res(values);
                        }
                    });
                });

                const newWidth = width;
                const newHeight = Math.round(newWidth * 2 / 3);
                outObj.width = width;
                outObj.height = height;
                await new Promise((res, rej) => {
                    ocv.readImage(file, async (err, image) => {
                        if (err) return rej(err);
                        image.cvtColor('CV_BGR2GRAY');
                        const boost = await faceDetect(image);
                        const skinColor = [203, 167, 155];
                        const { topCrop: crop } = await smartcrop.crop(
                            file,
                            {
                                width: newWidth,
                                height: newHeight,
                                boost,
                                skinColor: skinColor.map((val) => (val / 255)),
                            }
                        );

                        gm(file)
                        .crop(crop.width, crop.height, crop.x, crop.y)
                        .resize(600)
                        .write(outPath, (err) => {
                            if (err) return rej(err);
                            console.log('resized: ', file);
                            res();
                        });
                    });
                })
                outObj.thumbnailWidth = 600;
                outObj.thumbnailHeight = 400;
                out.push(outObj);
                resolve();
            })
        }));

        fs.writeFile(path.join(__dirname, '../../data/photos.json'), JSON.stringify(out), (err) => {
            if (err) {
                throw err;
            }
            console.log('The file has been saved!');
        });
    });
}

main(process.argv.length == 3 ? process.argv[2] : undefined);