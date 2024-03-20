const { createClient } = require('redis')

;(async () => {
    const EPOCHS = Number(process.env.EPOCHS) || 1
    const client = createClient()

    await client.connect()

    const metrics = []

    for (let i = 0; i < EPOCHS; i++) {
        const start = Date.now()
        const res = await client.ft.search('sink:idx:galleries', '*', {
            LIMIT: {
                from: getRandomInt(0, 10000),
                size: 10,
            },
            SORTBY: {
                BY: 'rating',
                DIRECTION: 'DESC'
            }
        })
        const end = Date.now()
        metrics.push(end - start)
    }

    console.log('metrics:', metrics)

    await client.disconnect();
})()

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
