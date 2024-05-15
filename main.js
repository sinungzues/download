//Download Multiple File
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');

const baseUrl = 'URL_TO_DOWNLOAD';

function isValidUrl(fileUrl) {
    const parsedUrl = url.parse(fileUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
}

function shouldSkipUrl(fileUrl) {
    // Tambahkan pengecekan URL yang perlu di-skip
    return fileUrl.includes('fonts.googleapis.com');
}

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
    } catch (error) {
        console.error(`Error downloading ${fileUrl}:`, error.message);
    }
}

async function scrapeAndDownloadFiles() {
    try {
        const { data } = await axios.get(baseUrl);
        const $ = cheerio.load(data);

        const assets = [];

        // Cari semua elemen <a>, <img>, <link>, dan <script>
        $('a[href], img[src], link[href], script[src]').each((i, elem) => {
            const href = $(elem).attr('href') || $(elem).attr('src');
            if (href && href !== '../' && href !== 'javascript:;' && !href.startsWith('#')) {
                const fileUrl = new URL(href, baseUrl).href;
                if (isValidUrl(fileUrl) && !shouldSkipUrl(fileUrl)) {  // Memeriksa apakah URL valid dan tidak perlu di-skip
                    assets.push(fileUrl);
                }
            }
        });

        for (let i = 0; i < assets.length; i++) {
            const fileUrl = assets[i];
            const parsedUrl = new URL(fileUrl);
            let outputPath = path.resolve(__dirname, 'downloads', parsedUrl.pathname.substring(1));

            // Log jenis file untuk debugging
            console.log(`File type for ${fileUrl}:`, fs.existsSync(outputPath) ? (fs.lstatSync(outputPath).isDirectory() ? 'directory' : 'file') : 'not exists');

            // Memeriksa apakah outputPath sudah ada sebagai direktori
            if (fs.existsSync(outputPath) && !fs.lstatSync(outputPath).isDirectory()) {
                // Jika bukan direktori, tambahkan nama file dari URL
                const fileName = path.basename(parsedUrl.pathname);
                outputPath = path.join(path.dirname(outputPath), fileName);
            }

            console.log(`Downloading ${fileUrl} to ${outputPath}`);
            await fs.ensureDir(path.dirname(outputPath)); // Membuat direktori jika belum ada
            await downloadFile(fileUrl, outputPath);
        }

        console.log('All files downloaded successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
}


scrapeAndDownloadFiles();
