#!/usr/bin/env node
const express = require('express')
const bodyParser = require('body-parser')
const yargs = require('yargs')
const db = require('../db')
const adapters = require('../adapters')
const authMiddleware = require('../middlewares/auth')
const channelRoutes = require('../routes/channel')

const argv = yargs
	.usage('Usage $0 [options]')
	.describe('adapter', 'the adapter for authentication and signing')
	.choices('adapter', Object.keys(adapters))
	.default('adapter', 'ethereum')
	.describe('keystoreFile', 'path to JSON Ethereum keystore file')
	.describe('dummyIdentity', 'the identity to use with the dummy adapter')
	.demandOption(['adapter'])
	.argv

const adapter = adapters[argv.adapter]
const app = express()
const port = process.env.PORT || 8005

app.use(bodyParser.json())
app.use(authMiddleware.forAdapter(adapter))
app.use('/channel', channelRoutes)

db.connect()
.then(function() {
	return adapter.init(argv)
})
.then(function() {
	app.listen(port, () => console.log(`Sentry listening on port ${port}!`))
})
.catch(function(err) {
	console.error('Fatal error while connecting to the database', err)
	process.exit(1)
})
