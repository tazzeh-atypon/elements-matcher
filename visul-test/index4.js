// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const { argv } = require('process');

// // Helper function to download a file and keep its folder structure
// async function downloadFileWithStructure(url, baseUrl, outputDir) {
//     try {
//         const relativePath = new URL(url, baseUrl).pathname;
//         const outputPath = path.join(outputDir, relativePath);

//         // Ensure the directory for the file exists
//         const outputDirPath = path.dirname(outputPath);
//         if (!fs.existsSync(outputDirPath)) {
//             fs.mkdirSync(outputDirPath, { recursive: true });
//         }

//         // Download and save the file
//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         fs.writeFileSync(outputPath, response.data);
//         console.log(`Downloaded: ${url} to ${outputPath}`);
//         return `.${relativePath}`; // Return the modified relative path
//     } catch (error) {
//         console.error(`Failed to download ${url}: ${error.message}`);
//         return null;
//     }
// }

// // Helper function to resolve full URLs
// function resolveUrl(baseUrl, assetUrl) {
//     return new URL(assetUrl, baseUrl).href;
// }


// async function downloadFontWithStructure(url, baseUrl, outputDir) {
//     try {
//         const relativePath = new URL(url, baseUrl).pathname;
//         const outputPath = path.join(outputDir, relativePath);

//         // Ensure the directory for the file exists
//         const outputDirPath = path.dirname(outputPath);
//         if (!fs.existsSync(outputDirPath)) {
//             fs.mkdirSync(outputDirPath, { recursive: true });
//         }

//         // Download and save the font file
//         const response = await axios.get(url, { responseType: 'arraybuffer' });
//         fs.writeFileSync(outputPath, response.data);
//         console.log(`Downloaded font: ${url} to ${outputPath}`);
//         return `.${relativePath}`; // Return the modified relative path
//     } catch (error) {
//         console.error(`Failed to download font ${url}: ${error.message}`);
//         return null;
//     }
// }

// async function processFontsInCSS(cssUrls, baseUrl, outputDir) {
//     const fontRegex = /\.(woff|woff2|ttf|eot|otf)$/i;
//     for (const cssUrl of cssUrls) {
//         const resolvedCssUrl = resolveUrl(baseUrl, cssUrl);
//         const cssContent = fs.readFileSync(resolvedCssUrl, 'utf8');

//         // Find font URLs in the CSS and update them
//         const updatedCssContent = cssContent.replace(/url\(["']?([^"')]+)["']?\)/g, async (match, fontUrl) => {
//             if (fontRegex.test(fontUrl)) {
//                 const resolvedFontUrl = resolveUrl(baseUrl, fontUrl);
//                 const newFontPath = await downloadFontWithStructure(resolvedFontUrl, baseUrl, outputDir);
//                 return `url(${newFontPath})`; // Replace with local font path
//             }
//             return match; // Keep the original URL if not a font
//         });

//         // Save the updated CSS file
//         const updatedCssPath = path.join(outputDir, 'releasedAssets', 'css', path.basename(cssUrl));
//         fs.writeFileSync(updatedCssPath, updatedCssContent, 'utf8');
//         console.log(`Updated CSS file saved to ${updatedCssPath}`);
//     }
// }


// // Function to concatenate CSS files
// async function concatenateCSS(files, outputDir) {
//     let combinedCss = '';
//     for (const cssUrl of files) {
//         const filePath = path.join(outputDir, path.basename(cssUrl));
//         const fileContent = fs.readFileSync(filePath, 'utf-8');
//         combinedCss += fileContent + '\n';
//     }

//     const finalCssPath = path.join(outputDir, 'styles.css');
//     fs.writeFileSync(finalCssPath, combinedCss, 'utf-8');
//     return './styles.css'; // Return relative path to the new CSS file
// }

// // Function to concatenate JS files
// async function concatenateJS(files, outputDir) {
//     let combinedJs = '';
//     for (const jsUrl of files) {
//         const filePath = path.join(outputDir, path.basename(jsUrl));
//         const fileContent = fs.readFileSync(filePath, 'utf-8');
//         combinedJs += fileContent + '\n';
//     }

//     const finalJsPath = path.join(outputDir, 'scripts.js');
//     fs.writeFileSync(finalJsPath, combinedJs, 'utf-8');
//     return './scripts.js'; // Return relative path to the new JS file
// }

// // Main function to clone website
// async function cloneWebsite(url, outputDir, productName) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Navigate to the page
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Get the domain name for filtering
//     const { origin } = new URL(url);

//     // Get the HTML content of the page
//     let htmlContent = await page.content();

//     // Prepare directories
//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//     }

//     // Extract and process assets
//     const assets = await page.evaluate(() => {
//         const assetMapping = {
//             css: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((link) => link.href),
//             js: Array.from(document.querySelectorAll('script[src]')).map((script) => script.src),
//             img: Array.from(document.querySelectorAll('img[src]')).map((img) => img.src),
//             font: Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map((el) => {
//                 const fontUrlMatch = el.href || el.style.cssText.match(/url\((.*?)\)/);
//                 return fontUrlMatch ? fontUrlMatch[1] : null;
//             }).filter(Boolean),
//         };
//         return assetMapping;
//     });

//     // Process CSS files (including fonts)
//     // await processFontsInCSS(assets.css, url, outputDir);

//     // Process CSS files
//     for (const cssUrl of assets.css) {
//         if (cssUrl.startsWith(origin) || cssUrl.startsWith('/')) {
//             const resolvedCssUrl = resolveUrl(url, cssUrl);
//             const newPath = await downloadFileWithStructure(resolvedCssUrl, origin, outputDir);

//             if (newPath) {
//                 htmlContent = htmlContent.replace(new RegExp(cssUrl, 'g'), newPath);
//             }
//         }
//     }

//     // Process JS files
//     for (const jsUrl of assets.js) {
//         if (jsUrl.startsWith(origin) || jsUrl.startsWith('/')) {
//             const resolvedJsUrl = resolveUrl(url, jsUrl);
//             const newPath = await downloadFileWithStructure(resolvedJsUrl, origin, outputDir);

//             if (newPath) {
//                 htmlContent = htmlContent.replace(new RegExp(jsUrl, 'g'), newPath);
//             }
//         }
//     }

//     // Process font files
//     for (const fontUrl of assets.font) {
//         if (fontUrl.startsWith(origin) || fontUrl.startsWith('/')) {
//             const resolvedFontUrl = resolveUrl(url, fontUrl);
//             const newFontPath = await downloadFontWithStructure(resolvedFontUrl, url, outputDir);

//             if (newFontPath) {
//                 htmlContent = htmlContent.replace(new RegExp(fontUrl, 'g'), newFontPath);
//             }
//         }
//     }

//     // Process image files
//     for (const imgUrl of assets.img) {
//         if (imgUrl.startsWith(origin) || imgUrl.startsWith('/')) {
//             const resolvedImgUrl = resolveUrl(url, imgUrl);
//             const newPath = await downloadFileWithStructure(resolvedImgUrl, origin, outputDir);

//             if (newPath) {
//                 htmlContent = htmlContent.replace(new RegExp(imgUrl, 'g'), newPath);
//             }
//         }
//     }

//     // Handle node_modules assets
//     const nodeModulesAssets = assets.js.filter((jsUrl) => jsUrl.includes('node_modules'));
//     const nodeModulesCss = assets.css.filter((cssUrl) => cssUrl.includes('node_modules'));
//     const nodeModulesFonts = assets.font.filter((fontUrl) => fontUrl.includes('node_modules'));

//     if (nodeModulesAssets.length > 0 || nodeModulesCss.length > 0) {
//         const nodeModulesDir = path.join(outputDir, `products/${productName}/releasedAssets/node_modules`);

//         // Ensure the node_modules directory exists
//         if (!fs.existsSync(nodeModulesDir)) {
//             fs.mkdirSync(nodeModulesDir, { recursive: true });
//         }

//         // Download node_modules assets into the node_modules directory
//         const cssFiles = [];
//         const jsFiles = [];

//         // Download and save CSS files
//         for (const cssUrl of nodeModulesCss) {
//             const resolvedCssUrl = resolveUrl(url, cssUrl);
//             const relativePath = new URL(cssUrl, url).pathname;
//             const outputPath = path.join(nodeModulesDir, path.basename(relativePath));

//             try {
//                 const response = await axios.get(resolvedCssUrl, { responseType: 'arraybuffer' });
//                 fs.writeFileSync(outputPath, response.data);
//                 cssFiles.push(outputPath); // Track CSS file for concatenation
//                 console.log(`Node modules CSS saved: ${outputPath}`);
//             } catch (error) {
//                 console.error(`Failed to download node_modules CSS ${cssUrl}: ${error.message}`);
//             }
//         }

//         // Download and save JS files
//         for (const jsUrl of nodeModulesAssets) {
//             const resolvedJsUrl = resolveUrl(url, jsUrl);
//             const relativePath = new URL(jsUrl, url).pathname;
//             const outputPath = path.join(nodeModulesDir, path.basename(relativePath));

//             try {
//                 const response = await axios.get(resolvedJsUrl, { responseType: 'arraybuffer' });
//                 fs.writeFileSync(outputPath, response.data);
//                 jsFiles.push(outputPath); // Track JS file for concatenation
//                 console.log(`Node modules JS saved: ${outputPath}`);
//             } catch (error) {
//                 console.error(`Failed to download node_modules JS ${jsUrl}: ${error.message}`);
//             }
//         }

//         // Process node_modules font files
//         for (const fontUrl of nodeModulesFonts) {
//             const resolvedFontUrl = resolveUrl(url, fontUrl);
//             const newFontPath = await downloadFontWithStructure(resolvedFontUrl, url, outputDir);

//             if (newFontPath) {
//                 htmlContent = htmlContent.replace(new RegExp(fontUrl, 'g'), newFontPath);
//             }
//         }

//         // Concatenate and save CSS and JS files
//         const fontFilePath = await concatenateCSS(fontUrl, nodeModulesDir);
//         const cssFilePath = await concatenateCSS(cssFiles, nodeModulesDir);
//         const jsFilePath = await concatenateJS(jsFiles, nodeModulesDir);

//         // Inject the new CSS and JS links into HTML
//         htmlContent = htmlContent.replace('</head>', `<link rel="stylesheet" href="${cssFilePath}"></head>`);
//         htmlContent = htmlContent.replace('</head>', `<link rel="stylesheet" href="${fontUrl}"></head>`);
//         htmlContent = htmlContent.replace('</body>', `<script src="${jsFilePath}"></script>\n</body>`);
//     }

//     // Ensure all paths start with `.` for relative references
//     htmlContent = htmlContent.replace(/src="\/(.*?)"/g, 'src="./$1"');
//     htmlContent = htmlContent.replace(/href="\/(.*?)"/g, 'href="./$1"');

//     // Save updated HTML content
//     const htmlFilePath = path.join(outputDir, 'index.html');
//     fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
//     console.log(`Saved updated HTML to ${htmlFilePath}`);

//     await browser.close();
// }
// // Usage
// const sitename = argv[2];

// console.log('clone ' + sitename + " .......")
// const url = `https://${sitename}-stag.literatumonline.com/`; // Replace with the target website URL
// const outputDir = `./cloned-${sitename}`; // Replace with your desired output directory
// cloneWebsite(url, outputDir, sitename);
















import fs from 'fs';
import path from 'path';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { argv } from 'process';


// Helper function to resolve relative URL
function resolveUrl(base, relativeUrl) {
    try {
        return new URL(relativeUrl, base).href;
    } catch (error) {
        return relativeUrl; // If URL resolution fails, return the original URL
    }
}

// Helper function to download files (CSS, JS, Fonts, etc.)
async function downloadFileWithStructure(url, baseUrl, outputDir) {
    try {
        const relativePath = new URL(url, baseUrl).pathname;
        const outputPath = path.join(outputDir, relativePath);

        // Ensure the directory exists
        const outputDirPath = path.dirname(outputPath);
        if (!fs.existsSync(outputDirPath)) {
            fs.mkdirSync(outputDirPath, { recursive: true });
        }

        // Download and save the file
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath, response.data);
        console.log(`Downloaded: ${url} to ${outputPath}`);

        return path.relative(outputDir, outputPath); // Return relative path
    } catch (error) {
        console.error(`Failed to download file ${url}: ${error.message}`);
        return null;
    }
}

async function downloadAllResources(oDir,websiteUrl,site) {
    // const outputDir = path.resolve(
    //     __dirname,
    //     `products/${site}/releasedAssets/fonts`
    // );
    const outputDir = path.join(
        `./cloned-${sitename}`,
        'products',
        site,
        'releasedAssets',
        'fonts'
    );

    // Create the directory structure if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('response', async (response) => {
        const url = response.url();
        const resourceType = response.request().resourceType();
        
        if (resourceType === 'font') {
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
    
    await page.goto(websiteUrl, { waitUntil: 'networkidle0' }); 
    
    await browser.close();
}

// Function to process and download all assets (CSS, JS, Fonts, Images)
// Inside your cloneWebsite function
async function cloneWebsite(url, outputDir, sitename) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Get the domain name for filtering
    const { origin } = new URL(url);

    // Get the HTML content of the page
    let htmlContent = await page.content(); // Make sure this is initialized here

    // Prepare directories
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Extract and process assets
    const assets = await page.evaluate(() => {
        const assetMapping = {
            css: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((link) => link.href),
            js: Array.from(document.querySelectorAll('script[src]')).map((script) => script.src),
            img: Array.from(document.querySelectorAll('img[src]')).map((img) => img.src),
        };
        return assetMapping;
    });

    // Process and update CSS files
    for (const cssUrl of assets.css) {
        if (cssUrl.startsWith(origin) || cssUrl.startsWith('/')) {
            const resolvedCssUrl = resolveUrl(url, cssUrl);
            const newPath = await downloadFileWithStructure(resolvedCssUrl, origin, outputDir);

            if (newPath) {
                htmlContent = htmlContent.replace(new RegExp(cssUrl, 'g'), newPath); // Update htmlContent after each CSS file download
            }
        }
    }

    // Process and update JS files
    for (const jsUrl of assets.js) {
        if (jsUrl.startsWith(origin) || jsUrl.startsWith('/')) {
            const resolvedJsUrl = resolveUrl(url, jsUrl);
            const newPath = await downloadFileWithStructure(resolvedJsUrl, origin, outputDir);

            if (newPath) {
                htmlContent = htmlContent.replace(new RegExp(jsUrl, 'g'), newPath); // Update htmlContent after each JS file download
            }
        }
    }

    // Process and update image files
    for (const imgUrl of assets.img) {
        if (imgUrl.startsWith(origin) || imgUrl.startsWith('/')) {
            const resolvedImgUrl = resolveUrl(url, imgUrl);
            const newPath = await downloadFileWithStructure(resolvedImgUrl, origin, outputDir);

            if (newPath) {
                htmlContent = htmlContent.replace(new RegExp(imgUrl, 'g'), newPath); // Update htmlContent after each image download
            }
        }
    }

    await downloadAllResources(outputDir,url, sitename);

    // Ensure all paths start with `.` for relative references
    htmlContent = htmlContent.replace(/src="\/(.*?)"/g, 'src="./$1"');
    htmlContent = htmlContent.replace(/href="\/(.*?)"/g, 'href="./$1"');

    // Save updated HTML content
    const htmlFilePath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
    console.log(`Saved updated HTML to ${htmlFilePath}`);

    await browser.close();
}


const sitename = argv[2];

console.log('clone ' + sitename + " .......")
const url = `https://${sitename}-stag.literatumonline.com`; // Replace with the target website URL
const outputDir = `./cloned-${sitename}`; // Replace with your desired output directory
cloneWebsite(url, outputDir, sitename);

