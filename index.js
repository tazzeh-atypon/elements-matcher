#!/usr/bin/env node
import products  from './prods';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';
const args = process.argv.slice(2); // Remove the first two elements

// Function to fetch HTML using Puppeteer
async function fetchHtml(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    await browser.close();
    return html;
}


function queryBuilder(xpath){
    if (xpath.includes("has")){
        let zpath = xpath.replace("has(", "").replace("has (", "").replace(")", "").replace("/", "")
        return `//*[contains(text(),${zpath})]`
    }
    else {
        return xpath
    }
}

// Function to parse HTML and check CSS selector
async function checkCssSelector(url, cssSelector) {
    console.log('looking for matches ......')
    try {
        const html = await fetchHtml(url);
        const $ = cheerio.load(html);
        
        console.log(`URL: ${url}`);
        if (cssSelector.startsWith('/') || cssSelector.startsWith('//')){
            // Parse HTML for XPath
            let xPathQuery = queryBuilder(cssSelector);
            // console.log("----------------",xPathQuery);
            const doc = new DOMParser().parseFromString(html,"text/html");
            const xPathElements = xpath.select(xPathQuery, doc);
            
            if (xPathElements.length > 0) {
                console.log(`Matched elements with XPath: ${xPathElements.length}`);
                xPathElements.forEach((element, index) => {
                    console.log(`Element ${index + 1}:`, element.toString().substring(0, 50), " ...");
                    console.error(`---------------------------------------`);
                    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
                    console.error(`---------------------------------------`);
                });
            } else {
                console.log("No matches found with XPath.");
            }
        }
        else {
            const elements = $(cssSelector);
            if (elements.length > 0) {
                console.log(`Matched elements: ${elements.length}`);
                elements.each(function (index, element) {
                    console.log(`Element ${index + 1}:`, $.html(element).substring(0,50) ," ...");
                    
                    console.error(`---------------------------------------`);
                    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
                    console.error(`---------------------------------------`);
                });
            } else {
                // console.log($.html())
                args?.[2] && console.log("No matches found.");
            }   
        }
        } catch (error) {
        console.error(`Error processing URL: ${url} - ${error.message}`);
    }

}

// Check CSS selector for each URL
const matcher = (prodcut) => {
    let allProds = Object.values(products).join().split(",");
    if(prodcut != "all") {
        console.log(`product ${prodcut} matching started ......`)
        return async (selector) => {
            for (const url of products[prodcut]) {
                await checkCssSelector(url, selector);
            }
        }
    }
    else {
        console.log(`all products matching started`)
        return async (selector)=>{
            for (const url of allProds) {
                await checkCssSelector(url, selector);
            }
        }
    }
}


if (args.length === 0) {
    console.log('No arguments provided.');
} else {
    console.log('Arguments:', args);
}

const cssSelector = '.container .row';  // Replace with your CSS selector

const match = matcher(args?.[0] || "all");

match(args?.[1] || cssSelector);


