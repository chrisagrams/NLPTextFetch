import puppeteer from 'puppeteer';
import fs from 'fs';
import chalk from 'chalk';

const log = console.log;

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const retrieveDOI = async (doi, subdir, outdir) => {
    log(chalk.magenta('🤖 Invoking Chromium for DOI: ') + chalk.greenBright(doi + '...'));

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    log(chalk.magenta('🤖 Navigating...'));

    const id = doi;

    log(chalk.magenta(`🤖https://doi.org/${doi}`));
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
        fs.mkdirSync(`${outdir}/${subdir}`, { recursive: true})
    }

    fs.writeFileSync(`${outdir}/${subdir}/${doi.replace("/", "-")}.html`, content);

    log(chalk.magenta('⏲️ Waiting for 1-5 seconds...'));
    await sleep(1000* (Math.random() * 5));

    log(chalk.magenta('🤖 Closing Chromium...'));
    await browser.close();
};

const retrieveFromTargetFile = async (targetFile, outdir) => {
    try {
        const data = fs.readFileSync(targetFile, 'utf8');
        const json = JSON.parse(data);
        
        for (const key of Object.keys(json)) {
            const dois = json[key];

            if (!Array.isArray(dois)) {
                console.warn(`Skipping key '${key}' as it does not contain an array.`);
                continue;
            }

            for (const doi of dois) {
                await retrieveDOI(doi, key, outdir)
            }
        }
    } catch (err) {
        console.error("Error processing target file:", err);
    }
}

await retrieveFromTargetFile('targets.json', 'out');