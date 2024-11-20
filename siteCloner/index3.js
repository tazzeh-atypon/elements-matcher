// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');

// // Helper function to download a file with its folder structure
// async function downloadFileWithStructure(url, baseUrl, outputDir) {
//     try {
//         // Get the relative path of the file from the base URL
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
//         return relativePath;
//     } catch (error) {
//         console.error(`Failed to download ${url}: ${error.message}`);
//         return null;
//     }
// }

// // Helper function to resolve URLs
// function resolveUrl(baseUrl, assetUrl) {
//     return new URL(assetUrl, baseUrl).href;
// }

// // Main function
// async function cloneWebsite(url, outputDir) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     // Navigate to the page
//     await page.goto(url, { waitUntil: 'networkidle2' });

//     // Get the domain name for asset filtering
//     const { origin } = new URL(url);

//     // Get the HTML content of the page
//     let htmlContent = await page.content();

//     // Prepare directories
//     ensureDirectory(outputDir);

//     // Extract and process assets
//     const assets = await page.evaluate(() => {
//         const assetMapping = {
//             css: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((link) => link.href),
//             js: Array.from(document.querySelectorAll('script[src]')).map((script) => script.src),
//             img: Array.from(document.querySelectorAll('img[src]')).map((img) => img.src),
//         };
//         return assetMapping;
//     });

//     // Process CSS files
//     for (const cssUrl of assets.css) {
//         if (cssUrl.startsWith(origin) || cssUrl.startsWith('/')) {
//             const resolvedCssUrl = resolveUrl(url, cssUrl);
//             const relativePath = await downloadFileWithStructure(resolvedCssUrl, origin, outputDir);

//             if (relativePath) {
//                 htmlContent = htmlContent.replace(new RegExp(cssUrl, 'g'), `.${relativePath}`);
//             }
//         }
//     }

//     // Process JS files
//     for (const jsUrl of assets.js) {
//         if (jsUrl.startsWith(origin) || jsUrl.startsWith('/')) {
//             const resolvedJsUrl = resolveUrl(url, jsUrl);
//             const relativePath = await downloadFileWithStructure(resolvedJsUrl, origin, outputDir);

//             if (relativePath) {
//                 htmlContent = htmlContent.replace(new RegExp(jsUrl, 'g'), `.${relativePath}`);
//             }
//         }
//     }

//     // Process image files
//     for (const imgUrl of assets.img) {
//         if (imgUrl.startsWith(origin) || imgUrl.startsWith('/')) {
//             const resolvedImgUrl = resolveUrl(url, imgUrl);
//             const relativePath = await downloadFileWithStructure(resolvedImgUrl, origin, outputDir);

//             if (relativePath) {
//                 htmlContent = htmlContent.replace(new RegExp(imgUrl, 'g'), `.${relativePath}`);
//             }
//         }
//     }

//     // Save updated HTML content
//     const htmlFilePath = path.join(outputDir, 'index.html');
//     fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
//     console.log(`Saved updated HTML to ${htmlFilePath}`);

//     await browser.close();
// }

// // Helper function to ensure a directory exists
// function ensureDirectory(dir) {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }
// }

// // Usage
// const url = 'https://asmj-stag.literatumonline.com/'; // Replace with the target website URL
// const outputDir = './cloned-site2'; // Replace with your desired output directory
// ensureDirectory(outputDir);

// cloneWebsite(url, outputDir);











// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const { argv } = require('process');
// const { exec } = require('child_process');

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

// // Main function
// async function cloneWebsite(url, outputDir) {
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
//         };
//         return assetMapping;
//     });

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

// console.log('clone '+sitename+" .......")
// const url = `https://${sitename}-stag.literatumonline.com/`; // Replace with the target website URL
// const outputDir = `./cloned-${sitename}`; // Replace with your desired output directory
// cloneWebsite(url, outputDir);
// exec(`open ./cloned-${sitename}/index.html`)







const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { argv } = require('process');
const { exec } = require('child_process');

// Helper function to download a file and keep its folder structure
async function downloadFileWithStructure(url, baseUrl, outputDir) {
    try {
        const relativePath = new URL(url, baseUrl).pathname;
        const outputPath = path.join(outputDir, relativePath);

        // Ensure the directory for the file exists
        const outputDirPath = path.dirname(outputPath);
        if (!fs.existsSync(outputDirPath)) {
            fs.mkdirSync(outputDirPath, { recursive: true });
        }

        // Download and save the file
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath, response.data);
        console.log(`Downloaded: ${url} to ${outputPath}`);
        return `.${relativePath}`; // Return the modified relative path
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
        return null;
    }
}

// Helper function to resolve full URLs
function resolveUrl(baseUrl, assetUrl) {
    return new URL(assetUrl, baseUrl).href;
}

// Main function
async function cloneWebsite(url, outputDir ,product) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Get the domain name for filtering
    const { origin } = new URL(url);

    // Get the HTML content of the page
    let htmlContent = await page.content();

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

    // Process CSS files
    for (const cssUrl of assets.css) {
        if (cssUrl.startsWith(origin) || cssUrl.startsWith('/')) {
            const resolvedCssUrl = resolveUrl(url, cssUrl);
            const newPath = await downloadFileWithStructure(resolvedCssUrl, origin, outputDir);

            if (newPath) {
                htmlContent = htmlContent.replace(new RegExp(cssUrl, 'g'), newPath);
            }
        }
    }

    // Process JS files
    for (const jsUrl of assets.js) {
        if (jsUrl.startsWith(origin) || jsUrl.startsWith('/')) {
            const resolvedJsUrl = resolveUrl(url, jsUrl);
            const newPath = await downloadFileWithStructure(resolvedJsUrl, origin, outputDir);

            if (newPath) {
                htmlContent = htmlContent.replace(new RegExp(jsUrl, 'g'), newPath);
            }
        }
    }

    // Process image files
    for (const imgUrl of assets.img) {
        if (imgUrl.startsWith(origin) || imgUrl.startsWith('/')) {
            const resolvedImgUrl = resolveUrl(url, imgUrl);
            const newPath = await downloadFileWithStructure(resolvedImgUrl, origin, outputDir);

            if (newPath) {
                htmlContent = htmlContent.replace(new RegExp(imgUrl, 'g'), newPath);
            }
        }
    }

    // Handle node_modules assets
    const nodeModulesAssets = assets.js.filter((jsUrl) => jsUrl.includes(`/products/${product}/releasedAssets/node_modules`));
    const nodeModulesScriptPath = './node_modules_combined.js';
    let nodeModulesCombinedScript = '';

    for (const jsUrl of nodeModulesAssets) {
        try {
            const response = await axios.get(jsUrl);
            nodeModulesCombinedScript += response.data + '\n';
        } catch (error) {
            console.error(`Failed to fetch node_modules asset ${jsUrl}: ${error.message}`);
        }
    }

    const nodeModulesScriptOutputPath = path.join(outputDir, nodeModulesScriptPath);
    fs.writeFileSync(nodeModulesScriptOutputPath, nodeModulesCombinedScript);
    htmlContent += `<script src="${nodeModulesScriptPath}"></script>`;

    // Ensure all paths start with `.` for relative references
    htmlContent = htmlContent.replace(/src="\/(.*?)"/g, 'src="./$1"');
    htmlContent = htmlContent.replace(/href="\/(.*?)"/g, 'href="./$1"');

    // Save updated HTML content
    const htmlFilePath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
    console.log(`Saved updated HTML to ${htmlFilePath}`);

    await browser.close();
}
// Usage
const sitename = argv[2];

console.log('clone '+sitename+" .......")
const url = `https://${sitename}-stag.literatumonline.com/`; // Replace with the target website URL
const outputDir = `./cloned-${sitename}`; // Replace with your desired output directory
cloneWebsite(url, outputDir, sitename);
exec(`open ./cloned-${sitename}/index.html`)


