import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { argv } from 'process';

async function downloadAllResources(websiteUrl, outputDir) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('response', async (response) => {
        const url = response.url();
        const resourceType = response.request().resourceType();

        if (resourceType === 'font' ) {
            try {
                const buffer = await response.buffer();
                const fileName = path.basename(url);
                const filePath = path.join(outputDir, fileName);

                fs.writeFileSync(filePath, buffer);
                console.log(`Saved: ${fileName}`);
            } catch (err) {
                console.error(`Failed to save resource: ${url}`, err.message);
            }
        }
    });

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    await page.goto(websiteUrl, { waitUntil: 'networkidle2' });

    await browser.close();
}

// Usage example:
const websiteUrl = argv[2]; // Pass website URL as a command-line argument
const outputDir = path.resolve(__dirname, 'output_file');
downloadAllResources(websiteUrl, outputDir).catch(console.error);
