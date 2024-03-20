const { createClient, SchemaFieldTypes } = require('redis')

const client = createClient()

// FT.CREATE sink:idx:galleries ON JSON PREFIX 1 sink:galleries:data: SCHEMA $.rating AS rating NUMERIC $.uploadedBy AS uploadedBy TEXT $.views AS views NUMERIC
;(async () => {
    await client.connect()

    try {
        await client.ft.create('sink:idx:galleries', {
            '$.rating': {
                type: SchemaFieldTypes.NUMERIC,
                SORTABLE: true
            },
            // '$.age': {
            //     type: SchemaFieldTypes.NUMERIC,
            //     AS: 'age'
            // },
            // '$.coins': {
            //     type: SchemaFieldTypes.NUMERIC,
            //     AS: 'coins'
            // },
            // '$.email': {
            //     type: SchemaFieldTypes.TAG,
            //     AS: 'email'
            // }
        }, {
            ON: 'JSON',
            PREFIX: 'sink:galleries:data:',
        });
        console.log('Index created')
    } catch (e) {
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        } else {
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
            process.exit(1);
        }
    }

    const res = await client.ft.search('sink:idx:galleries', '@uploadedBy:nazmul12', {
        LIMIT: {
            from: 0,
            size: 1,
        },
        SORTBY: {
            BY: 'rating',
            DIRECTION: 'DESC'
        }
    })
    console.log([...res.documents.values()])

    await client.disconnect()
})()
