const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://www.aiub.edu";
    let allNotices = [];
    let currentNotice;
    let newNotiece = false;


const scrapeData = async () => {

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const elements = $('.card-block a');

        for (let i = 0; i < elements.length; i++) {
            const more = $(elements[i]).attr('href');
            const head = $(elements[i]).find('h5').text();
            allNotices.push({ head, more: `https://www.aiub.edu${more}` });
        }
        if (currentNotice !== allNotices[0]) {
            newNotiece = true;
            currentNotice = allNotices[0];
        }
        if(newNotiece === true){            //Test
            const noticeObj = { allNotices, currentNotice };
            newNotiece = false;
            return noticeObj;
        }

    } catch (error) {
        console.error('Error fetching the page:', error.message);
        throw error;
    }
};

module.exports = scrapeData;