import puppeteer from 'puppeteer';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import fs from 'fs/promises';

async function comparePages(url1, url2) {
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

        // Handle missing elements and add div to fill gaps
        await addDivsForMissingElements(page1, page2);

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
            { threshold: 0.5 }
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

async function addDivsForMissingElements(page1, page2) {
    await page2.evaluate(() => {
        // Get all elements on both pages
        const elementsPage1 = Array.from(document.querySelectorAll('*'));
        const elementsPage2 = Array.from(document.querySelectorAll('*'));

        elementsPage1.forEach((el1, index) => {
            // Check if the element exists in the same position on page2
            const rect1 = el1.getBoundingClientRect();
            const el2 = elementsPage2[index];
            const rect2 = el2 ? el2.getBoundingClientRect() : null;

            // If the element is missing in page2 (or has different position/size), add a div to fill the gap
            if (!rect2 || rect1.top !== rect2.top || rect1.left !== rect2.left || rect1.width !== rect2.width || rect1.height !== rect2.height) {
                // Add a div to the next adjacent element to fill the gap
                const nextElement = elementsPage2[index + 1];
                if (nextElement) {
                    const size = `${rect1.width}px`;
                    nextElement.style.position = 'relative';
                    nextElement.style.zIndex = 1;
                    const gapDiv = document.createElement('div');
                    gapDiv.style.position = 'absolute';
                    gapDiv.style.top = `${rect1.top}px`;
                    gapDiv.style.left = `${rect1.left}px`;
                    gapDiv.style.width = size;
                    gapDiv.style.height = `${rect1.height}px`;
                    gapDiv.style.backgroundColor = 'yellow'; // You wanted a yellow background to cover the gap
                    gapDiv.style.zIndex = 9999; // Make sure it's above other elements
                    nextElement.appendChild(gapDiv);
                }
            }
        });
    });
}

// Example usage
const url = 'https://siam-stag.literatumonline.com/';
const url2 = 'https://siam-prod.literatumonline.com/';
comparePages(url, url2);
