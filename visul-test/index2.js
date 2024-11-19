// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const axios = require('axios');
// const path = require('path');
// const urlLib = require('url');

// async function downloadFile(url, outputPath) {
//     try {
//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         fs.writeFileSync(outputPath, response.data);
//         console.log(`Downloaded: ${url}`);
//     } catch (error) {
//         console.error(`Failed to download ${url}: ${error.message}`);
//     }
// }

// async function downloadImagesAndUpdateHtml(images, baseUrl, outputDir, htmlContent) {
//     const assetsDir = path.join(outputDir, 'assets');
//     if (!fs.existsSync(assetsDir)) {
//         fs.mkdirSync(assetsDir);
//     }

//     // Process all images
//     for (const imgUrl of images) {
//         try {
//             const absoluteUrl = new URL(imgUrl, baseUrl).href;
//             const imageName = path.basename(new URL(absoluteUrl).pathname);
//             const imagePath = path.join(assetsDir, imageName);

//             // Download the image
//             await downloadFile(absoluteUrl, imagePath);

//             // Update the img src in HTML to point to the local file
//             const localImagePath = `./assets/${imageName}`;
//             htmlContent = htmlContent.replace(new RegExp(imgUrl, 'g'), localImagePath);
//         } catch (error) {
//             console.error(`Failed to process image ${imgUrl}: ${error.message}`);
//         }
//     }

//     return htmlContent;
// }

// async function downloadCss(cssUrl, baseUrl, outputPath) {
//     try {
//         const response = await axios.get(cssUrl);
//         let cssContent = response.data;

//         // Find and download assets in `url(...)` references
//         const assetRegex = /url\((['"]?)(.*?)\1\)/g;
//         let match;
//         while ((match = assetRegex.exec(cssContent)) !== null) {
//             const assetUrl = match[2];
//             try {
//                 const absoluteUrl = new URL(assetUrl, baseUrl).href;
//                 const assetName = path.basename(new URL(assetUrl, baseUrl).pathname);
//                 const assetPath = path.join(path.dirname(outputPath), assetName);

//                 await downloadFile(absoluteUrl, assetPath);

//                 // Update CSS to use local asset path
//                 cssContent = cssContent.replace(assetUrl, `./assets/${assetName}`);
//             } catch (error) {
//                 console.error(`Failed to process asset ${assetUrl}: ${error.message}`);
//             }
//         }

//         fs.appendFileSync(outputPath, `/* From: ${cssUrl} */\n${cssContent}\n`);
//     } catch (error) {
//         console.error(`Failed to download CSS: ${cssUrl}, Error: ${error.message}`);
//     }
// }

// async function cloneWebsite(url, outputDir, productName) {
//     const productDir = path.join(outputDir, 'products', productName, 'releasedAssets', 'js');
//     if (!fs.existsSync(productDir)) {
//         fs.mkdirSync(productDir, { recursive: true });
//     }

//     const assetsDir = path.join(outputDir, 'assets');
//     if (!fs.existsSync(assetsDir)) {
//         fs.mkdirSync(assetsDir);
//     }

//     const consolidatedCssFile = path.join(outputDir, 'styles.css');
//     const consolidatedJsFile = path.join(productDir, 'site-scripts.js');
//     fs.writeFileSync(consolidatedCssFile, '', 'utf-8');
//     fs.writeFileSync(consolidatedJsFile, '', 'utf-8');

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     let htmlContent = await page.content();

//     // Extract all resources (CSS, JS, Images)
//     const assets = await page.evaluate(() => {
//         const assetMapping = [];

//         // Extract CSS
//         document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
//             const href = link.getAttribute('href');
//             if (href) assetMapping.push({ type: 'css', url: href });
//         });

//         // Extract JS
//         document.querySelectorAll('script[src]').forEach(script => {
//             const src = script.getAttribute('src');
//             if (src) assetMapping.push({ type: 'js', url: src });
//         });

//         // Extract Images
//         document.querySelectorAll('img[src]').forEach(img => {
//             const src = img.getAttribute('src');
//             if (src) assetMapping.push({ type: 'img', url: src });
//         });

//         return assetMapping;
//     });

//     // Download CSS files
//     for (const { type, url: assetUrl } of assets) {
//         try {
//             const absoluteUrl = new URL(assetUrl, url).href;

//             if (type === 'css') {
//                 await downloadCss(absoluteUrl, url, consolidatedCssFile);
//                 htmlContent = htmlContent.replace(new RegExp(`<link[^>]*href=["']${assetUrl}["'][^>]*>`, 'g'), '');
//             } else if (type === 'js' && !assetUrl.includes('third-party')) {
//                 const jsContent = await axios.get(absoluteUrl).then(res => res.data);
//                 fs.appendFileSync(consolidatedJsFile, `\n/* From: ${absoluteUrl} */\n${jsContent}\n`);
//                 htmlContent = htmlContent.replace(new RegExp(`<script[^>]*src=["']${assetUrl}["'][^>]*></script>`, 'g'), '');
//             }
//         } catch (error) {
//             console.error(`Error processing asset ${assetUrl}: ${error.message}`);
//         }
//     }

//     // Download and update image URLs in HTML
//     const images = assets.filter(asset => asset.type === 'img').map(asset => asset.url);
//     htmlContent = await downloadImagesAndUpdateHtml(images, url, outputDir, htmlContent);

//     // Update HTML to link to the local CSS and JS files
//     htmlContent = htmlContent.replace(
//         '</head>',
//         `  <link rel="stylesheet" href="./styles.css">\n</head>`
//     );
//     htmlContent = htmlContent.replace(
//         '</body>',
//         `  <script src="/products/${productName}/releasedAssets/js/site-scripts.js"></script>\n</body>`
//     );

//     const htmlFilePath = path.join(outputDir, 'index.html');
//     fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
//     console.log(`Saved updated HTML to ${htmlFilePath}`);

//     await browser.close();
// }

// // Usage
// const url = 'https://asmj-stag.literatumonline.com/'; // Replace with the target website URL
// const outputDir = './cloned-site2'; // Replace with your desired output directory
// const productName = 'asmj'; // Replace with the product name

// cloneWebsite(url, outputDir, productName);










import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function downloadFile(url, outputPath) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath, response.data);
        console.log(`Downloaded: ${url}`);
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
    }
}

async function processCss(cssUrl, baseUrl, outputPath, assetsDir) {
    try {
        const response = await axios.get(cssUrl);
        let cssContent = response.data;

        // Find and download assets in `url(...)` references
        const assetRegex = /url\((['"]?)(.*?)\1\)/g;
        let match;
        while ((match = assetRegex.exec(cssContent)) !== null) {
            const assetUrl = match[2];
            try {
                const absoluteUrl = new URL(assetUrl, baseUrl).href;
                const assetName = path.basename(new URL(assetUrl, baseUrl).pathname);
                const assetPath = path.join(assetsDir, assetName);

                await downloadFile(absoluteUrl, assetPath);

                // Update CSS to use local asset path
                cssContent = cssContent.replace(assetUrl, `./assets/${assetName}`);
            } catch (error) {
                console.error(`Failed to process asset ${assetUrl}: ${error.message}`);
            }
        }

        fs.appendFileSync(outputPath, `/* From: ${cssUrl} */\n${cssContent}\n`);
    } catch (error) {
        console.error(`Failed to process CSS: ${cssUrl}: ${error.message}`);
    }
}

async function cloneWebsite(url, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const assetsDir = path.join(outputDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const htmlContent = await page.content();
    let updatedHtml = htmlContent;

    const consolidatedCssFile = path.join(outputDir, 'styles.css');
    const consolidatedJsFile = path.join(outputDir, 'scripts.js');
    fs.writeFileSync(consolidatedCssFile, '', 'utf-8');
    fs.writeFileSync(consolidatedJsFile, '', 'utf-8');

    const assets = await page.evaluate(() => {
        const assetMapping = [];
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            assetMapping.push({ type: 'css', url: link.href });
        });
        document.querySelectorAll('script[src]').forEach(script => {
            assetMapping.push({ type: 'js', url: script.src });
        });
        document.querySelectorAll('img[src]').forEach(img => {
            assetMapping.push({ type: 'img', url: img.src });
        });
        return assetMapping;
    });

    for (const { type, url: assetUrl } of assets) {
        try {
            const absoluteUrl = new URL(assetUrl, url).href;

            if (type === 'css') {
                await processCss(absoluteUrl, url, consolidatedCssFile, assetsDir);
                updatedHtml = updatedHtml.replace(new RegExp(`<link[^>]*href=["']${assetUrl}["'][^>]*>`, 'g'), '');
            } else if (type === 'js') {
                const jsContent = await axios.get(absoluteUrl).then(res => res.data);
                fs.appendFileSync(consolidatedJsFile, `\n/* From: ${absoluteUrl} */\n${jsContent}\n`);
                updatedHtml = updatedHtml.replace(new RegExp(`<script[^>]*src=["']${assetUrl}["'][^>]*></script>`, 'g'), '');
            } else if (type === 'img') {
                const imageName = path.basename(new URL(assetUrl).pathname);
                const imagePath = path.join(assetsDir, imageName);
                await downloadFile(absoluteUrl, imagePath);
                updatedHtml = updatedHtml.replace(new RegExp(assetUrl, 'g'), `./assets/${imageName}`);
            }
        } catch (error) {
            console.error(`Failed to process ${type}: ${assetUrl}: ${error.message}`);
        }
    }

    updatedHtml = updatedHtml.replace(
        '</head>',
        `  <link rel="stylesheet" href="./styles.css">\n</head>`
    );
    updatedHtml = updatedHtml.replace(
        '</body>',
        `  <script src="./scripts.js"></script>\n</body>`
    );

    const htmlFilePath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlFilePath, updatedHtml, 'utf-8');
    console.log(`Saved updated HTML to ${htmlFilePath}`);

    await browser.close();
}

// Usage
const url = 'https://asmj-stag.literatumonline.com/'; // Replace with the target URL
const outputDir = './cloned-site'; // Replace with your desired output directory

cloneWebsite(url, outputDir);






// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');

// const savePageClone = async (url, outputDir) => {
//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//     }

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     let html = await page.content();

//     const consolidatedCssFile = path.join(outputDir, 'styles.css');
//     const consolidatedJsFile = path.join(outputDir, 'scripts.js');
//     const imagesDir = path.join(outputDir, 'images');

//     if (!fs.existsSync(imagesDir)) {
//         fs.mkdirSync(imagesDir);
//     }

//     // Clear consolidated files
//     fs.writeFileSync(consolidatedCssFile, '', 'utf-8');
//     fs.writeFileSync(consolidatedJsFile, '', 'utf-8');

//     const downloadAndSave = async (url, outputPath, type) => {
//         try {
//             const response = await axios.get(url, { responseType: 'arraybuffer' });
//             fs.writeFileSync(outputPath, response.data);
//             console.log(`Saved ${type}: ${url}`);
//         } catch (error) {
//             console.error(`Failed to fetch ${type} from ${url}: ${error.message}`);
//         }
//     };

//     const assets = await page.evaluate(() => {
//         const assetMapping = [];
//         const addAsset = (type, element, attr) => {
//             const url = element[attr];
//             if (url) assetMapping.push({ type, url, elementSelector: element.outerHTML, attr });
//         };
//         document.querySelectorAll('link[rel="stylesheet"]').forEach(link => addAsset('css', link, 'href'));
//         document.querySelectorAll('script[src]').forEach(script => addAsset('js', script, 'src'));
//         document.querySelectorAll('img[src]').forEach(img => addAsset('img', img, 'src'));
//         return assetMapping;
//     });

//     for (const { type, url: assetUrl, elementSelector, attr } of assets) {
//         try {
//             const urlObj = new URL(assetUrl, url); // Resolve relative URLs
//             const resolvedUrl = urlObj.href;

//             if (type === 'css') {
//                 await downloadAndSave(resolvedUrl, consolidatedCssFile, 'CSS');
//                 html = html.replace(elementSelector, ''); // Remove old CSS link
//             } else if (type === 'js') {
//                 await downloadAndSave(resolvedUrl, consolidatedJsFile, 'JavaScript');
//                 html = html.replace(elementSelector, ''); // Remove old JS script
//             } else if (type === 'img') {
//                 const imageName = path.basename(urlObj.pathname);
//                 const imagePath = path.join(imagesDir, imageName);
//                 await downloadAndSave(resolvedUrl, imagePath, 'Image');
//                 html = html.replace(
//                     new RegExp(elementSelector, 'g'),
//                     elementSelector.replace(assetUrl, `./images/${imageName}`)
//                 );
//             }
//         } catch (error) {
//             console.error(`Error processing asset ${assetUrl}: ${error.message}`);
//         }
//     }

//     // Inject consolidated CSS and JS into HTML
//     html = html.replace(
//         '</head>',
//         `  <link rel="stylesheet" href="./styles.css">\n</head>`
//     );
//     html = html.replace(
//         '</body>',
//         `  <script src="./scripts.js"></script>\n</body>`
//     );

//     // Save the updated HTML
//     const htmlFile = path.join(outputDir, 'index.html');
//     fs.writeFileSync(htmlFile, html, 'utf-8');
//     console.log(`Saved updated HTML to ${htmlFile}`);

//     await browser.close();
//     console.log(`Cloning completed. Open ${path.resolve(htmlFile)} to view the cloned site.`);
// };

// // Usage
// const url = 'https://asmj-stag.literatumonline.com/'; // Replace with the target URL
// const outputDir = './cloned-site'; // Replace with your desired output directory

// savePageClone(url, outputDir);


