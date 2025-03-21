#!/usr/bin/env node
//comment 1
import products  from './QAproductsList.js';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';
const args = process.argv.slice(2); // Remove the first two elements


const helper = {
    getBaseUrl: (url) => {
        const parsedUrl = new URL(url);
        return `${parsedUrl.protocol}//${parsedUrl.hostname}/`;
    }
}


// Function to fetch HTML using Puppeteer
async function fetchHtml(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // console.log("aaaaaaaaaaaa", helper.getBaseUrl(url)+"action/alist")
    // await page.goto(helper.getBaseUrl(url) + "action/alist", { waitUntil: 'networkidle0' });

    // await page.type('#openid_url', 'http://support.atypon.com/user/tazzeh'); // Replace with the actual selector for the username field
    // await page.click(".go_btn");

    // // Wait for navigation (if the login redirects to another page)
    // await page.waitForNavigation();


    // // Fill in the login form
    // await page.type('#login', 'tazzeh'); // Replace with the actual selector for the username field
    // await page.type('#password', 'tsBHXwuH'); // Replace with the actual selector for the password field

    // await page.click('input[name="submit"]'); // Replace with the actual selector for the login button
    // // Wait for navigation (if the login redirects to another page)
    // await page.waitForNavigation();


    // // // Click the login button
    // // await page.click('#login-button'); // Replace with the actual selector for the login button

    // // Wait for navigation (if the login redirects to another page)
    // await page.waitForNavigation();
    // Set mobile emulation
    if (args.includes("mobile")){
        // const mobileViewport = puppeteer.devices['iPhone 12'];
        await page.setViewport({ width: 375, height: 812, isMobile: true });
    }


    await page.goto(url, { waitUntil: 'networkidle0' });
    



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
async function checkCssSelector(url, cssSelector,args) {
    try {
        const html = await fetchHtml(url,args);
        const $ = cheerio.load(html);
        
        console.log(`\n~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~`);
        console.log(`\n Page : ${url} Searching ...`);
        if (cssSelector.startsWith('/') || cssSelector.startsWith('//')){
            // Parse HTML for XPath
            let xPathQuery = queryBuilder(cssSelector);
            // console.log("----------------",xPathQuery);
            const doc = new DOMParser().parseFromString(html,"text/html");
            const xPathElements = xpath.select(xPathQuery, doc);
            
            if (xPathElements.length > 0) {
                console.log(`\nMatched elements with XPath: ${xPathElements.length}\n`);
                let maxRes = xPathElements.length > 10 ? 10 : xPathElements.length;
                xPathElements.slice(0, maxRes).forEach((element, index) => {
                    console.log(`Element ${index + 1}:`, element.toString().substring(0, 50), " ...");
                    console.warn(`- - - - - - - - - - - - - - - - -`);
                });
            } else {
                console.log("No matches found with XPath.");
            }
        }
        else {
            const elements = $(cssSelector);
            if (elements.length > 0) {
                console.log(`Matched elements: ${elements.length}\n`);
                let maxRes = elements.length > 10 ? 10 : elements.length;
                elements.splice(0, maxRes).each(function (index, element) {
                    console.log(`Element ${index + 1}:`, $.html(element).substring(0,50) ," ...");
                    
                    console.warn(`- - - - - - - - - - - - - - - - -`);
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


class ProdMapper {
    productsList = [];
    siteList = ["asmj"] //"all" , asmj ,["siam","arrs"];
    prodsTree = [];
    allProds = [];
    filters = "none";
    constructor( prodsTree) {
        this.prodsTree = prodsTree;
        this.allProds = this.getAllProds();
    }
    // private
    getAllProds(){
        return Object.keys(this.prodsTree);
    }
    // public
    setSitesList(siteList) {
        this.siteList = siteList;
    } 
    //list products names
    // public
    getProdsList() {
        if (this.siteList == "all") {
            return this.getAllProds();
        }
        else if (this.siteList.includes(",")) {
            let spreadedList = this.siteList.replaceAll("r[\[\]]", "").split(",");
            return spreadedList.filter((value) => this.allProds.includes(value));
        }
        else {
            return [this.allProds.find(prod => this.siteList == prod)]
        }
    }
    // get prods names
    // 
    setFilters(filter) {
        this.filters = filter.includes(",") ? filter.replaceAll(' ','').split(","):filter;
    }
    //
    fetchSitePages(site) {
        let siteObj = this.prodsTree[site];
        let pages = [];
        if (!siteObj) return;
        if (siteObj.hasOwnProperty('multi')){
            let domains = Object.keys(siteObj["multi"]);
            domains.forEach(domain => {
                let directions = Object.values(siteObj["multi"][domain]) //page
                directions.forEach(path => {
                    pages.push(`https://${domain}${path}`.replaceAll("-", "."))
                });
            });
        }
        else {
            Object.values(siteObj).forEach(path => {
                pages.push(`https://${site}-prod.literatumonline.com${path}`)
            });
        }

        return pages;
    }
    //get getProdsList as param and returns pages list combined
    getProductsTree(sitelist) {
        if (sitelist.length == 0) return {};
        let site = sitelist.pop();
        let fetchedPages = this.fetchSitePages(site);
        return { ...this.getProductsTree(sitelist),[site]:fetchedPages,}
    }
}

// Check CSS selector for each URL
const matcher = async (prods, pattern,args) => {
    if (!prods) return;
    let keysCollection = Object.keys(prods);
    let currentProd = keysCollection[0];
    if (!currentProd) { console.log("items exploration finshed"); return};
    console.warn(`Start Matching On ${keysCollection} .......\n`)
    let pageList = prods[currentProd];
    delete prods[currentProd];
    for (const url of pageList) {
        await checkCssSelector(url, pattern,args);
    }
    return matcher(prods,pattern,args);
}

const prodList = args?.[0];
const pattern = args?.[1];
const filter = args?.[2];// to be continued
console.log("\nProduct/s: ", prodList)
const prodMapper = new ProdMapper(products);
prodMapper.setSitesList(prodList);
let prods = prodMapper.getProductsTree(prodMapper.getProdsList());
matcher(prods,pattern,[...args]);
// console.log("filters: ", filter);



