require("newrelic");
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

const express = require("express");
const client = require("prom-client");

const app = express();

const requestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of requests",
});

const requestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Request duration in seconds",
    buckets: [0.1, 0.5, 1, 2, 5],
});
// middleware to measure time!
app.use((req, res, next) => {
    const end = requestDuration.startTimer();
    res.on("finish", () => {
        end();
        requestCounter.inc();
    });
    next();
});
app.get("/", (req, res) => {
    logger.info("route hit");
    if (Math.random() < 0.5) {
        logger.error("there was an err");
    }
    res.json({ message: "hi there" })
});

// this is what prometheus will read
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(3000, () => {
    console.log("listening on port 3000");
});