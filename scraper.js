const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://www.aiub.edu";
let previousNotices = [];

const scrapeData = async () => {

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const elements = $('.card-block a');
        let newNotices = [];
        for (let i = 0; i < elements.length; i++) {
            const more = $(elements[i]).attr('href');
            const head = $(elements[i]).find('h5').text();
            newNotices.push({ head, more: `https://www.aiub.edu${more}` });
        }
        const hasChanged = JSON.stringify(newNotices) !== JSON.stringify(previousNotices);
        if(hasChanged){
            previousNotices = newNotices;
            return newNotices;
        }

    } catch (error) {
        console.error('Error fetching the page:', error.message);
    }
};

module.exports = scrapeData;