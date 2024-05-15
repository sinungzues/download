const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

const baseUrl = 'https://seantheme.com/color-admin/admin/assets/plugins/ionicons/dist/ionicons/svg/';

async function downloadFile(fileUrl, outputPath) {
    try {
        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream'
        });

        await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log(`Downloaded ${fileUrl} to ${outputPath}`);
    } catch (error) {
        console.error(`Error downloading ${fileUrl}:`, error.message);
    }
}

async function scrapeAndDownloadFiles() {
    try {
        const { data } = await axios.get(baseUrl);
        const $ = cheerio.load(data);

        const assets = [];

        // Cari semua elemen <a>
        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && !href.startsWith('../') && !href.startsWith('javascript:;') && !href.startsWith('#')) {
                const fileUrl = new URL(href, baseUrl).href;
                assets.push(fileUrl);
            }
        });

        for (let i = 0; i < assets.length; i++) {
            const fileUrl = assets[i];
            const fileName = path.basename(fileUrl);
            const outputPath = path.resolve(__dirname, 'downloads', fileName);

            console.log(`Downloading ${fileUrl} to ${outputPath}`);
            await downloadFile(fileUrl, outputPath);
        }

        console.log('All files downloaded successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
}

scrapeAndDownloadFiles();

// const axios = require('axios');
// const fs = require('fs-extra');
// const path = require('path');
// const { URL } = require('url');

// const baseUrl = 'https://fkkbihu.or.id/fksidiq/templates/admin_v41/template/assets/plugins/nvd3/build/';
// const outputDir = path.resolve(__dirname, 'downloads');

// async function downloadFilesFromDirectory(baseUrl, directoryPath, outputDir) {
//     try {
//         const { data } = await axios.get(baseUrl + directoryPath);
//         const directoryUrl = new URL(directoryPath, baseUrl).href;

//         const fileLinks = parseFileLinks(data);

//         // Download each file
//         for (const fileLink of fileLinks) {
//             const fileUrl = new URL(fileLink, directoryUrl).href;
//             const fileName = path.basename(fileUrl);
//             const outputPath = path.join(outputDir, fileName);
//             await downloadFile(fileUrl, outputPath);
//         }

//         console.log(`All files from ${directoryPath} downloaded successfully.`);
//     } catch (error) {
//         console.error(`Error downloading files from ${directoryPath}:`, error.message);
//     }
// }

// function parseFileLinks(html) {
//     // You need to determine how to find all links to files in the directory
//     // Here you can use regular expressions or other methods to extract links
//     // Here's a simple example using regular expressions:
//     const regex = /<a href="([^"]+)">([^<]+)<\/a>/g;
//     const fileLinks = [];
//     let match;
//     while ((match = regex.exec(html)) !== null) {
//         fileLinks.push(match[1]);
//     }
//     return fileLinks;
// }

// async function downloadFile(fileUrl, outputPath) {
//     try {
//         const response = await axios({
//             url: fileUrl,
//             method: 'GET',
//             responseType: 'stream'
//         });

//         await new Promise((resolve, reject) => {
//             const writer = fs.createWriteStream(outputPath);
//             response.data.pipe(writer);
//             writer.on('finish', resolve);
//             writer.on('error', reject);
//         });
//         console.log(`Downloaded ${fileUrl} to ${outputPath}`);
//     } catch (error) {
//         console.error(`Error downloading ${fileUrl}:`, error.message);
//     }
// }

// (async () => {
//     await downloadFilesFromDirectory(baseUrl, '', outputDir);
// })();
