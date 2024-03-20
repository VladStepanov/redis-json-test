const { createClient } = require('redis')
const { Pool } = require('pg')

const GALLERIES_PER_BATCH = 1000

;(async () => {
    const client = createClient()

    await client.connect()

    const con = new Pool({
        host: '127.0.0.1',
        port: 54326,
        user: 'dev',
        password: 'dev',
        database: 'tubes',
    })

    let rows = []
    let i = 0

    do {
        const result = await con.query(`
            SELECT gt.gallery_id, gt.tube_id
            FROM galleries_tubes gt
            INNER JOIN galleries_tubes_regions gtr
                ON gtr.gallery_id = gt.gallery_id AND
                    gtr.tube_id = gt.tube_id
            WHERE gt.status = 1
              AND gtr.region_id = 1
            LIMIT ${GALLERIES_PER_BATCH}
            OFFSET ${GALLERIES_PER_BATCH * i}
        `)
        rows = result.rows

        console.log(`Processed: ${i};`)
        await Promise.all(
            rows.map(async (r) => {
                const args = [`sink:galleries:index:popular:${r.tube_id}`, { score: getRandomInt(0, 1_000_000), value: String(r.gallery_id) }]
                try {
                    await client.zAdd(...args)
                } catch (e) {
                    console.log('Got error:', e, args)
                    throw e
                }
            })
        )

        i++
    } while (rows.length)

    await con.end()
    await client.disconnect()
})()

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
