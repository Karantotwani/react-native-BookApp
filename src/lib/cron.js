import cron from 'cron';
import https from 'https';

const job = new cron.CronJob('*/14 * * * *', function () {
    https.get(process.env.CRON_URI, (res) => {
        if (res.statusCode == 200) 
            console.error(`Cron job suucess with status code: ${res.statusCode}`);
        else 
            console.error(`Cron job failed with status code: ${res.statusCode}`);
        })
        .on('error', (e) => {
            console.error(`Cron job error: ${e.message}`);
        });
    }
);

export default job;