import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const port = 5001
const max = 1000
const urls = []

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({origin: '*'}))
app.use(express.static(path.resolve(__dirname, '../../client')));

function generateId(max, urls){
    let id;
    do {
        id = `pro${Math.floor(Math.random() * max)}`
    } while (urls.some(e => e.key === id))
    return id
}

app.get('/:url', (req,res) => {
    let id = req.params.url
    const urlObject = urls.find((u) => { return u.key == id })
    if (!urlObject) {
        return res.sendStatus(404)
    }
    if (req.accepts('application/json')){
        return res.json({ location: urlObject.url })
    }
    return res.redirect(urlObject.url)
})

app.post('/shorten', (req, res) => {
    console.info('Creating new URL entry', req.body)
    const id = generateId(max, urls)
    const entry = {
        url: req.body.longUrl.startsWith('http') ? req.body.longUrl : `https://${req.body.longUrl}`,
        label: req.body.label,
        key: id,
        short_url: `http://loc.al/${id}`
    }
    urls.push(entry)
    return res.status(200).send({"short_url": entry.short_url, "label": entry.label})
})

app.listen(port, () => {
    console.log('API Server is running on port:', port)
    console.log('Web Interface: http://localhost:5001')
})