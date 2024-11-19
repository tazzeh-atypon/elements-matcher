import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { promises as fs } from 'fs';

async function compareComponents(url1, url2, selector) {
    const browser = await puppeteer.launch({ headless: true });
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    try {
        const viewport = { width: 1280, height: 720 };
        await page1.setViewport(viewport);
        await page2.setViewport(viewport);

        // Load pages
        await Promise.all([
            page1.goto(url1, { waitUntil: 'load' }),
            page2.goto(url2, { waitUntil: 'load' }),
        ]);

        // Select components by selector
        const [component1, component2] = await Promise.all([
            page1.$(selector),
            page2.$(selector),
        ]);

        if (!component1 || !component2) {
            console.error('Component not found on one or both pages');
            return;
        }

        // Capture bounding boxes
        const [bbox1, bbox2] = await Promise.all([
            component1.boundingBox(),
            component2.boundingBox(),
        ]);

        if (!bbox1 || !bbox2) {
            console.error('Bounding box could not be determined for one or both components');
            return;
        }

        // Screenshot the specific components
        const screenshot1Path = 'component1.png';
        const screenshot2Path = 'component2.png';

        await Promise.all([
            page1.screenshot({
                path: screenshot1Path,
                clip: bbox1,
            }),
            page2.screenshot({
                path: screenshot2Path,
                clip: bbox2,
            }),
        ]);

        // Compare screenshots
        const img1 = PNG.sync.read(await fs.readFile(screenshot1Path));
        const img2 = PNG.sync.read(await fs.readFile(screenshot2Path));

        const maxWidth = Math.max(img1.width, img2.width);
        const maxHeight = Math.max(img1.height, img2.height);

        const resizedImg1 = resizeImage(img1, maxWidth, maxHeight);
        const resizedImg2 = resizeImage(img2, maxWidth, maxHeight);

        const diff = new PNG({ width: maxWidth, height: maxHeight });
        const numDiffPixels = pixelmatch(
            resizedImg1.data,
            resizedImg2.data,
            diff.data,
            maxWidth,
            maxHeight,
            { threshold: 0.1 }
        );

        await fs.writeFile('diff.png', PNG.sync.write(diff));
        console.log(`Comparison completed. ${numDiffPixels} pixels differ.`);
    } catch (error) {
        console.error('Error during component comparison:', error);
    } finally {
        await browser.close();
    }
}

function resizeImage(img, width, height) {
    const resizedImg = new PNG({ width, height });
    resizedImg.data.fill(0);

    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            const srcIdx = (y * img.width + x) * 4;
            const dstIdx = (y * width + x) * 4;

            resizedImg.data[dstIdx] = img.data[srcIdx];
            resizedImg.data[dstIdx + 1] = img.data[srcIdx + 1];
            resizedImg.data[dstIdx + 2] = img.data[srcIdx + 2];
            resizedImg.data[dstIdx + 3] = img.data[srcIdx + 3];
        }
    }

    return resizedImg;
}

// Example usage
const url1 = 'https://achs-prod.literatumonline.com/';
const url2 = 'https://achs-test.literatumonline.com/';
const selector = '.slider-multi-search'; // Adjust this to target your specific widget
compareComponents(url1, url2, selector);
