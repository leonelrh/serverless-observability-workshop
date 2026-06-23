const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const { Unit } = require("aws-embedded-metrics");
const { logMetricEMF } = require('../lib/logging/logger')

let _cold_start = true

exports.getByIdHandler = async (event, context) => {
    let response, id
    try {
        if (_cold_start) {
            //Metrics
            await logMetricEMF('ColdStart', unit = Unit.Count, 1, { service: 'item_service', function_name: context.functionName })
            _cold_start = false
        }
        if (event.httpMethod !== 'GET') {
            await logMetricEMF('UnsupportedHTTPMethod', unit = Unit.Count, 1, { service: 'item_service', operation: 'get-by-id' })
            throw new Error(`getById only accept GET method, you tried: ${event.httpMethod}`)
        }

        id = event.pathParameters.id
        const item = await getItemById(id)
        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(item)
        }
        //Metrics
        await logMetricEMF('SuccessfulGetItem', unit = Unit.Count, 1, { service: 'item_service', operation: 'get-by-id' })
    } catch (err) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(err)
        }
        //Metrics
        await logMetricEMF('FailedGetItem', unit = Unit.Count, 1, { service: 'item_service', operation: 'get-by-id' })
    }
        
    return response
}