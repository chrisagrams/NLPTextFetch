import puppeteer from 'puppeteer-core';
import fs from 'fs';
import chalk from 'chalk';

const log = console.log;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const retrieveDOI = async (doi, subdir, outdir) => {
    const filePath = `${outdir}/${subdir}/${doi.replace("/", "-")}.html`;

    if (fs.existsSync(filePath)) {
        log(chalk.yellow(`📂 Skipping ${doi} - File already exists.`));
        return;
    }

    log(chalk.magenta('🤖 Attaching to existing Chrome instance for DOI: ') + chalk.greenBright(doi + '...'));

    const browser = await puppeteer.connect({
        browserURL: 'http://localhost:9222',
        defaultViewport: null
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    log(chalk.magenta('🤖 Navigating...'));

    log(chalk.magenta(`🤖 Visiting: https://doi.org/${doi}`));
    await page.goto(`https://doi.org/${doi}`, {
        waitUntil: 'networkidle0'
    });

    log(chalk.magenta('🔎 Awaiting content...'));
    const content = await page.content();

    log(chalk.magenta('✏️ Writing content to file...'));
    if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir, { recursive: true });
    }
    if (!fs.existsSync(`${outdir}/${subdir}`)) {
        fs.mkdirSync(`${outdir}/${subdir}`, { recursive: true });
    }

    fs.writeFileSync(filePath, content);

    log(chalk.magenta('⏲️ Waiting for 1-5 seconds...'));
    await sleep(1000 * (Math.random() * 5));

    log(chalk.magenta('🤖 Done with DOI:', doi));

    log(chalk.magenta(`🛑 Closing tab for DOI: ${doi}`));
    await page.close();
};

const retrieveFromTargetFile = async (targetFile, outdir) => {
    if (!fs.existsSync(targetFile)) {
        console.error(chalk.red(`❌ Error: Target file "${targetFile}" does not exist.`));
        return;
    }

    try {
        const data = fs.readFileSync(targetFile, 'utf8');
        const json = JSON.parse(data);

        for (const key of Object.keys(json)) {
            const dois = json[key];

            if (!Array.isArray(dois)) {
                console.warn(chalk.yellow(`⚠️ Skipping key '${key}' as it does not contain an array.`));
                continue;
            }

            for (const doi of dois) {
                await retrieveDOI(doi, key, outdir);
            }
        }
    } catch (err) {
        console.error(chalk.red("❌ Error processing target file:"), err);
};

// Ensure Chrome is running with: 
// google-chrome --remote-debugging-port=9222
await retrieveFromTargetFile('targets.json', 'out');
