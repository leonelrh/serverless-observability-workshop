const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
const { Unit } = require("aws-embedded-metrics");
const { logMetricEMF } = require('../lib/logging/logger')

let _cold_start = true

exports.getAllItemsHandler = async (event, context) => {
    let response
    try {
        if (_cold_start) {
            //Metrics
            await logMetricEMF('ColdStart', unit = Unit.Count, 1, { service: 'item_service', function_name: context.functionName })
            _cold_start = false
        }
        if (event.httpMethod !== 'GET') {
            await logMetricEMF('UnsupportedHTTPMethod', unit = Unit.Count, 1, { service: 'item_service', operation: 'get-all-items' })
            throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`)
        }

        const items = await getAllItems()
        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(items)
        }
        //Metrics
        await logMetricEMF('SuccessfulGetAllItems', unit = Unit.Count, 1, { service: 'item_service', operation: 'get-all-items' })
    } catch (err) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(err)
        }
        //Metrics
        await logMetricEMF('FailedGetAllItems', unit = Unit.Count, 1, { service: 'item_service', operation: 'get-all-items' })
    }
        
    return response
}