
import express from "express";
import http from "http";
import path from "path";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = new http.Server(app);


const port = 8000;

// start server
server.listen(port, function() {
    console.log("Starting server on port " + port);
});

app.set("port", port);
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'dist')));
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/static", express.static(__dirname + "/static"));
app.use("/views", express.static(__dirname + "/views"));
app.use('/src', express.static(path.join(__dirname, '../src')));
console.log("Serving static from:", path.join(__dirname));
// remove when add client to client-src

// http routing
