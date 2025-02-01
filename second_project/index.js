const http = require("http")
const jsonData = require("./output")
const port = 3000;

//const data = fs.readFileSync(__dirname + '/output.js', "utf-8")
const jsData= JSON.stringify(jsonData)
const server = http.createServer((req, res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if(req.method === "OPTIONS"){
        res.statusCode = 204;
        res.end()
        return
    }

    if (req.method === 'GET' && req.url === "/"){
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(jsData)
    }else{
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain')
        res.end("Request Not founds")
    }
})

server.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})
