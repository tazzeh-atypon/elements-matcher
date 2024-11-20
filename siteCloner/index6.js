import puppeteer from 'puppeteer';
// import pixelmatch from 'pixelmatch';
// import { createCanvas, loadImage } from 'canvas';
// import fs from 'fs';

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Capture first page
//     await page.goto('https://asmj-stag.literatumonline.com/');
//     await page.screenshot({ path: 'page1.png' });

//     // Capture second page
//     await page.goto('https://www.microsoft.com/en/microsoft-365/word?market=af');
//     await page.screenshot({ path: 'page2.png' });

//     await browser.close();

//     // Compare screenshots
//     const img1 = await loadImage('page1.png');
//     const img2 = await loadImage('page2.png');

//     const canvas = createCanvas(img1.width, img1.height);
//     const context = canvas.getContext('2d');

//     const diff = context.createImageData(img1.width, img1.height);
//     const numDiffPixels = pixelmatch(
//         context.getImageData(0, 0, img1.width, img1.height).data,
//         context.getImageData(0, 0, img2.width, img2.height).data,
//         diff.data,
//         img1.width,
//         img1.height,
//         { threshold: 0.1 }
//     );

//     console.log(`Number of differing pixels: ${numDiffPixels}`);
//     fs.writeFileSync('diff.png', canvas.toBuffer());
// })();

import { diffWords } from 'diff';

// const puppeteer = require('puppeteer');
// const { diffWords } = require('diff');

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Fetch HTML content of first page
//     await page.goto('https://asmj-stag.literatumonline.com/');
//     const html1 = await page.content();

//     // Fetch HTML content of second page
//     await page.goto('https://asmj-stag.literatumonline.com/');
//     const html2 = await page.content();

//     await browser.close();

//     // Compare HTML structures
//     const differences = diffWords(html1, html2);

//     differences.forEach((part) => {
//         const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
//         console.log(`%c${part.value}`, `color: ${color}`);
//     });
// })();


// gooooooooood
// import pixelmatch from 'pixelmatch';
// import { PNG } from 'pngjs';
// import fs from 'fs';

// /**
//  * Compare two pages visually by generating screenshots and highlighting differences.
//  * @param {string} url1 - URL of the first page.
//  * @param {string} url2 - URL of the second page.
//  */
// async function comparePages(url1, url2) {
//     const browser = await puppeteer.launch({ headless: true });
//     const page1 = await browser.newPage();
//     const page2 = await browser.newPage();

//     const viewport = { width: 1280, height: 720 };

//     try {
//         // Set viewport size for consistent screenshots
//         await page1.setViewport(viewport);
//         await page2.setViewport(viewport);

//         // Navigate to both pages
//         await Promise.all([page1.goto(url1), page2.goto(url2)]);

//         // Take screenshots
//         const screenshot1Path = 'page1.png';
//         const screenshot2Path = 'page2.png';
//         const diffPath = 'diff.png';

//         await page1.screenshot({ path: screenshot1Path, fullPage: true });
//         await page2.screenshot({ path: screenshot2Path, fullPage: true });

//         console.log('Screenshots captured.');

//         // Compare screenshots
//         const img1 = PNG.sync.read(fs.readFileSync(screenshot1Path));
//         const img2 = PNG.sync.read(fs.readFileSync(screenshot2Path));
//         const { width, height } = img1;
//         const diff = new PNG({ width, height });

//         const numDiffPixels = pixelmatch(
//             img1.data,
//             img2.data,
//             diff.data,
//             width,
//             height,
//             { threshold: 0.1 }
//         );

//         // Save the diff image
//         fs.writeFileSync(diffPath, PNG.sync.write(diff));
//         console.log(`Comparison completed. ${numDiffPixels} pixels differ.`);
//         console.log(`Check the diff image: ${diffPath}`);
//     } catch (error) {
//         console.error('Error during page comparison:', error);
//     } finally {
//         await browser.close();
//     }
// }

// // Example usage
// const url1 = 'https://asmj-stag.literatumonline.com/';
// const url2 = 'https://asmj-stag.literatumonline.com/';

// comparePages(url1, url2);



// gooooooooooooooooood2 

// import pixelmatch from 'pixelmatch';
// import { PNG } from 'pngjs';
// import fs from 'fs';

// /**
//  * Compare two pages visually by ensuring full load and then capturing screenshots.
//  * @param {string} url1 - URL of the first page.
//  * @param {string} url2 - URL of the second page.
//  */
// async function comparePages(url1, url2) {
//     const browser = await puppeteer.launch({ headless: true });
//     const page1 = await browser.newPage();
//     const page2 = await browser.newPage();

//     const viewport = { width: 1280, height: 720 };

//     try {
//         // Set viewport size for consistent screenshots
//         await page1.setViewport(viewport);
//         await page2.setViewport(viewport);

//         // Hide images before navigating to the local files to prevent differences caused by images
//         await hideImages(page1);
//         await hideImages(page2);


//         // Load both pages and wait until fully loaded
//         await Promise.all([
//             loadPageFully(page1, url1),
//             loadPageFully(page2, url2),
//         ]);

//         // Take screenshots
//         const screenshot1Path = 'page1.png';
//         const screenshot2Path = 'page2.png';
//         const diffPath = 'diff.png';

//         await page1.screenshot({ path: screenshot1Path, fullPage: true });
//         await page2.screenshot({ path: screenshot2Path, fullPage: true });

//         console.log('Screenshots captured.');

//         // Compare screenshots
//         const img1 = PNG.sync.read(fs.readFileSync(screenshot1Path));
//         const img2 = PNG.sync.read(fs.readFileSync(screenshot2Path));
//         const { width, height } = img1;
//         const diff = new PNG({ width, height });

//         const numDiffPixels = pixelmatch(
//             img1.data,
//             img2.data,
//             diff.data,
//             width,
//             height,
//             { threshold: 0.7 }
//         );

//         // Save the diff image
//         fs.writeFileSync(diffPath, PNG.sync.write(diff));
//         console.log(`Comparison completed. ${numDiffPixels} pixels differ.`);
//         console.log(`Check the diff image: ${diffPath}`);
//     } catch (error) {
//         console.error('Error during page comparison:', error);
//     } finally {
//         await browser.close();
//     }
// }

// /**
//  * Load a page and ensure it's fully loaded.
//  * @param {object} page - Puppeteer Page object.
//  * @param {string} url - URL to load.
//  */

// async function hideImages(page) {
//     await page.addStyleTag({
//         content: 'img { display: none !important; }'
//     });
//     console.log('Images hidden.');
// }


// async function loadPageFully(page, url) {
//     console.log(`Loading ${url}...`);
//     await page.goto(url, { waitUntil: 'networkidle0' });

//     // Optional: Wait for a specific element to confirm page readiness
//     await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for animations or delayed elements.
//     console.log(`${url} fully loaded.`);
// }

// // Example usage
// const url1 = 'https://pubs.acs.org/';
// const url2 = 'https://achs-test.literatumonline.com/';

// comparePages(url1, url2);











///////////////////////////////
// handle image size difference 


import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';


/**
 * Compare two local HTML files visually, covering images and handling different sizes.
 * @param {string} filePath1 - Path to the first local HTML file.
 * @param {string} filePath2 - Path to the second local HTML file.
 */
async function compareLocalPages(filePath1, filePath2) {
    const browser = await puppeteer.launch({ headless: true });
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    try {
        const viewport = { width: 1280, height: 720 };

        // Set viewport size
        await page1.setViewport(viewport);
        await page2.setViewport(viewport);

        // Apply CSS to cover images before navigating to the local files
        await applyImageOverlay(page1);
        await applyImageOverlay(page2);

        // Load both local HTML files
        await Promise.all([
            loadLocalPage(page1, filePath1),
            loadLocalPage(page2, filePath2),
        ]);

        // Take screenshots
        const screenshot1Path = 'page1.png';
        const screenshot2Path = 'page2.png';
        const diffPath = 'diff.png';

        await page1.screenshot({ path: screenshot1Path, fullPage: true });
        await page2.screenshot({ path: screenshot2Path, fullPage: true });

        console.log('Screenshots captured.');

        // Load screenshots as PNGs
        const img1 = PNG.sync.read(fs.readFileSync(screenshot1Path));
        const img2 = PNG.sync.read(fs.readFileSync(screenshot2Path));

        // Adjust dimensions to match the larger image
        const maxWidth = Math.max(img1.width, img2.width);
        const maxHeight = Math.max(img1.height, img2.height);

        const resizedImg1 = resizeImage(img1, maxWidth, maxHeight);
        const resizedImg2 = resizeImage(img2, maxWidth, maxHeight);

        // Perform visual comparison
        const diff = new PNG({ width: maxWidth, height: maxHeight });
        const numDiffPixels = pixelmatch(
            resizedImg1.data,
            resizedImg2.data,
            diff.data,
            maxWidth,
            maxHeight,
            { threshold: 0.5 }
        );

        // Save the diff image
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
        console.log(`Comparison completed. ${numDiffPixels} pixels differ.`);
        console.log(`Check the diff image: ${diffPath}`);
    } catch (error) {
        console.error('Error during page comparison:', error);
    } finally {
        await browser.close();
    }
}

/**
 * Load a local HTML file.
 * @param {object} page - Puppeteer Page object.
 * @param {string} filePath - Path to the local HTML file.
 */
async function loadLocalPage(page, filePath) {
    const fileUrl = `${filePath}`;
    console.log(`Loading local file: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
}

/**
 * Apply CSS to overlay images with a solid color.
 * @param {object} page - Puppeteer Page object.
 */
async function applyImageOverlay(page) {
    await page.addStyleTag({
        content: `
      img {
        position: relative;
        background: gray !important; /* Use gray to cover images */
        color: gray !important;     /* Prevent text showing over background */
      }
    `,
    });
    console.log('Images covered with a solid overlay.');
}

/**
 * Resize an image to a given width and height.
 * @param {PNG} img - The image to resize.
 * @param {number} width - The target width.
 * @param {number} height - The target height.
 * @returns {PNG} - The resized image.
 */
function resizeImage(img, width, height) {
    const resizedImg = new PNG({ width, height });
    resizedImg.data.fill(0); // Fill with transparent pixels

    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            const srcIdx = (y * img.width + x) * 4;
            const dstIdx = (y * width + x) * 4;

            resizedImg.data[dstIdx] = img.data[srcIdx];       // Red
            resizedImg.data[dstIdx + 1] = img.data[srcIdx + 1]; // Green
            resizedImg.data[dstIdx + 2] = img.data[srcIdx + 2]; // Blue
            resizedImg.data[dstIdx + 3] = img.data[srcIdx + 3]; // Alpha
        }
    }

    return resizedImg;
}

// Example usage with local HTML files
const filePath1 = 'https://markabte.com/';
const filePath2 = 'https://markabte.com/';

compareLocalPages(filePath1, filePath2);



