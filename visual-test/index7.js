import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs/promises';

async function comparePages(url1, url2, selector = null) {
    const browser = await puppeteer.launch({ headless: true });
    const page1 = await browser.newPage();
    const page2 = await browser.newPage();

    try {
        const viewport = { width: 1280, height: 720 };
        await page1.setViewport(viewport);
        await page2.setViewport(viewport);

        // Load both pages
        await Promise.all([
            page1.goto(url1, { waitUntil: 'networkidle0' }),
            page2.goto(url2, { waitUntil: 'networkidle0' }),
        ]);

        // Close popups dynamically
        await Promise.all([closePopups(page1), closePopups(page2)]);

        // Cover images and ads
        await Promise.all([
            coverImagesAndAds(page1),
            coverImagesAndAds(page2),
        ]);

        // Take full-page screenshots
        const screenshot1Path = 'page1.png';
        const screenshot2Path = 'page2.png';
        await Promise.all([
            page1.screenshot({ path: screenshot1Path, fullPage: true }),
            page2.screenshot({ path: screenshot2Path, fullPage: true }),
        ]);

        // Compare screenshots
        const img1 = PNG.sync.read(await fs.readFile(screenshot1Path));
        const img2 = PNG.sync.read(await fs.readFile(screenshot2Path));

        const { width, height } = img1;
        const diff = new PNG({ width, height });

        const diffPixels = pixelmatch(
            img1.data,
            img2.data,
            diff.data,
            width,
            height,
            { threshold: 0.1 }
        );

        await fs.writeFile('diff.png', PNG.sync.write(diff));
        console.log(`Comparison completed. Differences: ${diffPixels} pixels`);
    } catch (error) {
        console.error('Error during page comparison:', error);
    } finally {
        await browser.close();
    }
}

async function closePopups(page) {
    try {
        // Adjust selectors based on the specific site
        const popups = await page.$$('div[class*="popup"], div[class*="overlay"]');
        for (const popup of popups) {
            await popup.evaluate(node => node.style.display = 'none');
        }
    } catch (error) {
        console.warn('No popups detected or failed to close:', error);
    }
}

async function coverImagesAndAds(page) {
    await page.evaluate(() => {
        // Cover all images
        document.querySelectorAll('img').forEach(img => {
            const overlay = document.createElement('div');
            const rect = img.getBoundingClientRect();
            Object.assign(overlay.style, {
                position: 'absolute',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                backgroundColor: 'gray',
                zIndex: 9999,
            });
            document.body.appendChild(overlay);
        });

        // Cover all ads
        document.querySelectorAll('[aria-label="Advertisement"]').forEach(ad => {
            const overlay = document.createElement('div');
            const rect = ad.getBoundingClientRect();
            Object.assign(overlay.style, {
                position: 'absolute',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                backgroundColor: 'gray',
                zIndex: 9999,
            });
            document.body.appendChild(overlay);
        });
    });
}

// Example usage
const url = 'https://siam-stag.literatumonline.com/';
comparePages(url, url);









// import puppeteer from 'puppeteer';
// import pixelmatch from 'pixelmatch';
// import { PNG } from 'pngjs';
// import { promises as fs } from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// async function comparePages(url1, url2) {
//     const browser = await puppeteer.launch({ headless: true });
//     const page1 = await browser.newPage();
//     const page2 = await browser.newPage();

//     try {
//         const viewport = { width: 1280, height: 720 };
//         await page1.setViewport(viewport);
//         await page2.setViewport(viewport);

//         // Load pages with full resources
//         await Promise.all([
//             loadPage(page1, url1),
//             loadPage(page2, url2),
//         ]);

//         // Inject CSS to cover images and ads
//         await Promise.all([
//             injectCoverCSS(page1),
//             injectCoverCSS(page2),
//         ]);

//         const screenshot1Path = 'page1.png';
//         const screenshot2Path = 'page2.png';
//         const diffPath = 'diff.png';

//         // Take screenshots
//         await page1.screenshot({ path: screenshot1Path, fullPage: true });
//         await page2.screenshot({ path: screenshot2Path, fullPage: true });

//         // Compare images
//         const img1 = PNG.sync.read(await fs.readFile(screenshot1Path));
//         const img2 = PNG.sync.read(await fs.readFile(screenshot2Path));

//         const maxWidth = Math.max(img1.width, img2.width);
//         const maxHeight = Math.max(img1.height, img2.height);

//         const resizedImg1 = resizeImage(img1, maxWidth, maxHeight);
//         const resizedImg2 = resizeImage(img2, maxWidth, maxHeight);

//         const diff = new PNG({ width: maxWidth, height: maxHeight });
//         const numDiffPixels = pixelmatch(
//             resizedImg1.data,
//             resizedImg2.data,
//             diff.data,
//             maxWidth,
//             maxHeight,
//             { threshold: 0.1 }
//         );

//         await fs.writeFile(diffPath, PNG.sync.write(diff));
//         console.log(`Comparison completed. ${numDiffPixels} pixels differ.`);
//     } catch (error) {
//         console.error('Error during page comparison:', error);
//     } finally {
//         await browser.close();
//     }
// }

// async function loadPage(page, url) {
//     if (url.startsWith('http')) {
//         await page.goto(url, { waitUntil: 'load' });
//     } else {
//         const __dirname = path.dirname(fileURLToPath(import.meta.url));
//         const fileUrl = `file://${path.resolve(__dirname, url)}`;
//         await page.goto(fileUrl, { waitUntil: 'load' });
//     }
// }

// async function injectCoverCSS(page) {
//     await page.evaluate(() => {
//         const style = document.createElement('style');
//         style.textContent = `
//       img, [aria-label="Advertisement"], iframe {
//         position: relative;
//         background-color: rgba(255, 255, 255, 0.8) !important;
//         z-index: 9999 !important;
//         width: auto !important;
//         height: auto !important;
//       }
//     `;
//         document.head.appendChild(style);
//     });
// }

// function resizeImage(img, width, height) {
//     const resizedImg = new PNG({ width, height });
//     resizedImg.data.fill(0);

//     for (let y = 0; y < img.height; y++) {
//         for (let x = 0; x < img.width; x++) {
//             const srcIdx = (y * img.width + x) * 4;
//             const dstIdx = (y * width + x) * 4;

//             resizedImg.data[dstIdx] = img.data[srcIdx];
//             resizedImg.data[dstIdx + 1] = img.data[srcIdx + 1];
//             resizedImg.data[dstIdx + 2] = img.data[srcIdx + 2];
//             resizedImg.data[dstIdx + 3] = img.data[srcIdx + 3];
//         }
//     }

//     return resizedImg;
// }

// const url1 = 'https://psychiatryonline.org/doi/book/10.1176/appi.books.9780890425787';
// const url2 = 'https://psychiatryonline.org/doi/book/10.1176/appi.books.9780890425787';

// comparePages(url1, url2);












// import puppeteer from 'puppeteer';
// import pixelmatch from 'pixelmatch';
// import { PNG } from 'pngjs';
// import { promises as fs } from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// async function comparePages(url1, url2) {
//     const browser = await puppeteer.launch({ headless: true });
//     const page1 = await browser.newPage();
//     const page2 = await browser.newPage();

//     try {
//         const viewport = { width: 1280, height: 720 };
//         await page1.setViewport(viewport);
//         await page2.setViewport(viewport);

//         // Load pages without relying on specific loading time
//         await Promise.all([
//             loadPage(page1, url1),
//             loadPage(page2, url2),
//         ]);

//         // Dynamically cover images and ads
//         await Promise.all([
//             dynamicallyCoverElements(page1),
//             dynamicallyCoverElements(page2),
//         ]);

//         const screenshot1Path = 'page1.png';
//         const screenshot2Path = 'page2.png';
//         const diffPath = 'diff.png';

//         await page1.screenshot({ path: screenshot1Path, fullPage: true });
//         await page2.screenshot({ path: screenshot2Path, fullPage: true });

//         const img1 = PNG.sync.read(await fs.readFile(screenshot1Path));
//         const img2 = PNG.sync.read(await fs.readFile(screenshot2Path));

//         const maxWidth = Math.max(img1.width, img2.width);
//         const maxHeight = Math.max(img1.height, img2.height);

//         const resizedImg1 = resizeImage(img1, maxWidth, maxHeight);
//         const resizedImg2 = resizeImage(img2, maxWidth, maxHeight);

//         const diff = new PNG({ width: maxWidth, height: maxHeight });
//         const numDiffPixels = pixelmatch(
//             resizedImg1.data,
//             resizedImg2.data,
//             diff.data,
//             maxWidth,
//             maxHeight,
//             { threshold: 0.1 }
//         );

//         await fs.writeFile(diffPath, PNG.sync.write(diff));
//         console.log(`Comparison completed. ${numDiffPixels} pixels differ.`);
//     } catch (error) {
//         console.error('Error during page comparison:', error);
//     } finally {
//         await browser.close();
//     }
// }

// async function loadPage(page, url) {
//     if (url.startsWith('http')) {
//         await page.goto(url, { waitUntil: 'networkidle0' });
//     } else {
//         const __dirname = path.dirname(fileURLToPath(import.meta.url));
//         const fileUrl = `file://${path.resolve(__dirname, url)}`;
//         await page.goto(fileUrl, { waitUntil: 'networkidle0' });
//     }
// }

// async function dynamicallyCoverElements(page) {
//     await page.evaluate(() => {
//         // Function to cover specific elements
//         function coverElement(el) {
//             el.style.position = 'relative !important';
//             el.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
//             el.style.zIndex = '9999';
//             el.style.width = `${el.offsetWidth}px`;
//             el.style.height = `${el.offsetHeight}px`;
//         }

//         // Initial covering of existing elements
//         document.querySelectorAll('img, [aria-label="Advertisement"], iframe').forEach(coverElement);

//         // Mutation Observer for dynamically added elements
//         const observer = new MutationObserver((mutations) => {
//             mutations.forEach((mutation) => {
//                 if (mutation.type === 'childList') {
//                     mutation.addedNodes.forEach((node) => {
//                         if (node.tagName === 'IMG' || node.hasAttribute('aria-label') || node.tagName === 'IFRAME') {
//                             if (node.getAttribute('aria-label') === 'Advertisement' || node.tagName === 'IMG' || node.tagName === 'IFRAME') {
//                                 coverElement(node);
//                             }
//                         }
//                     });
//                 }
//             });
//         });

//         observer.observe(document.body, { childList: true, subtree: true });
//     });
// }

// function resizeImage(img, width, height) {
//     const resizedImg = new PNG({ width, height });
//     resizedImg.data.fill(0);

//     for (let y = 0; y < img.height; y++) {
//         for (let x = 0; x < img.width; x++) {
//             const srcIdx = (y * img.width + x) * 4;
//             const dstIdx = (y * width + x) * 4;

//             resizedImg.data[dstIdx] = img.data[srcIdx];
//             resizedImg.data[dstIdx + 1] = img.data[srcIdx + 1];
//             resizedImg.data[dstIdx + 2] = img.data[srcIdx + 2];
//             resizedImg.data[dstIdx + 3] = img.data[srcIdx + 3];
//         }
//     }

//     return resizedImg;
// }

// const url1 = 'https://psychiatryonline.org/doi/book/10.1176/appi.books.9780890425787';
// const url2 = 'https://psychiatryonline.org/doi/book/10.1176/appi.books.9780890425787';

// comparePages(url1, url2);















// // const puppeteer = require('puppeteer');
// // const pixelmatch = require('pixelmatch');
// // const { PNG } = require('pngjs');
// // const fs = require('fs');
// // const path = require('path');

// import puppeteer from "puppeteer";
// import Pixelmatch from "pixelmatch";
// import { PNG } from "pngjs";
// import fs from 'fs';
// // import path from path;
// // import fs from fs;

// /**
//  * Compare two pages visually while covering images and ads.
//  * @param {string} url1 - URL or file path of the first page.
//  * @param {string} url2 - URL or file path of the second page.
//  */
// async function comparePages(url1, url2) {
//     const browser = await puppeteer.launch({ headless: true, timeout: 60000 });
//     const page1 = await browser.newPage();
//     const page2 = await browser.newPage();

//     try {
//         const viewport = { width: 1280, height: 720 };

//         // Set viewport size
//         await page1.setViewport(viewport);
//         await page2.setViewport(viewport);

//         // Load both pages (local or live)
//         await Promise.all([
//             loadPage(page1, url1),
//             loadPage(page2, url2),
//         ]);

//         // Cover images and ads on both pages
//         await Promise.all([
//             coverImagesAndAds(page1),
//             coverImagesAndAds(page2),
//         ]);

//         // Take screenshots
//         const screenshot1Path = 'page1.png';
//         const screenshot2Path = 'page2.png';
//         const diffPath = 'diff.png';

//         await page1.screenshot({ path: screenshot1Path, fullPage: true });
//         await page2.screenshot({ path: screenshot2Path, fullPage: true });

//         console.log('Screenshots captured.');

//         // Load screenshots as PNGs
//         const img1 = PNG.sync.read(fs.readFileSync(screenshot1Path));
//         const img2 = PNG.sync.read(fs.readFileSync(screenshot2Path));

//         // Adjust dimensions to match the larger image
//         const maxWidth = Math.max(img1.width, img2.width);
//         const maxHeight = Math.max(img1.height, img2.height);

//         const resizedImg1 = resizeImage(img1, maxWidth, maxHeight);
//         const resizedImg2 = resizeImage(img2, maxWidth, maxHeight);

//         // Perform visual comparison
//         const diff = new PNG({ width: maxWidth, height: maxHeight });
//         const numDiffPixels = Pixelmatch(
//             resizedImg1.data,
//             resizedImg2.data,
//             diff.data,
//             maxWidth,
//             maxHeight,
//             { threshold: 0.5 }
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
//  * Load a page (local or live).
//  * @param {object} page - Puppeteer Page object.
//  * @param {string} url - URL or local file path.
//  */
// async function loadPage(page, url) {
//     if (url.startsWith('http')) {
//         console.log(`Loading live URL: ${url}`);
//         await page.goto(url, { waitUntil: 'domcontentloaded' });
//     } else {
//         const fileUrl = `file://${path.resolve(url)}`;
//         console.log(`Loading local file: ${fileUrl}`);
//         await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
//     }
// }

// /**
//  * Cover images and ads with a neutral overlay.
//  * @param {object} page - Puppeteer Page object.
//  */
// async function coverImagesAndAds(page) {
//     await page.addStyleTag({
//         content: `
//       img, [aria-label="Advertisement"] {
//         position: relative !important;
//       }
//       img::after, [aria-label="Advertisement"]::after {
//         content: '';
//         position: absolute;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: rgba(255, 255, 255, 0.8); /* White overlay with transparency */
//         z-index: 9999;
//         pointer-events: none;
//       }
//     `,
//     });
//     console.log('Images and ads covered with overlay.');
// }

// /**
//  * Resize an image to a given width and height.
//  * @param {PNG} img - The image to resize.
//  * @param {number} width - The target width.
//  * @param {number} height - The target height.
//  * @returns {PNG} - The resized image.
//  */
// function resizeImage(img, width, height) {
//     const resizedImg = new PNG({ width, height });
//     resizedImg.data.fill(0); // Fill with transparent pixels

//     for (let y = 0; y < img.height; y++) {
//         for (let x = 0; x < img.width; x++) {
//             const srcIdx = (y * img.width + x) * 4;
//             const dstIdx = (y * width + x) * 4;

//             resizedImg.data[dstIdx] = img.data[srcIdx];       // Red
//             resizedImg.data[dstIdx + 1] = img.data[srcIdx + 1]; // Green
//             resizedImg.data[dstIdx + 2] = img.data[srcIdx + 2]; // Blue
//             resizedImg.data[dstIdx + 3] = img.data[srcIdx + 3]; // Alpha
//         }
//     }

//     return resizedImg;
// }

// // Example usage with a live URL and a local HTML file
// const url1 = 'https://psychiatryonline.org/';
// const url2 = 'https://psychiatryonline.org/';

// comparePages(url1, url2);

