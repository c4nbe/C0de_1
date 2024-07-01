const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const DATA_FILE = 'posts.json';

app.get('/api/posts', (req, res) => {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        res.send(JSON.parse(data));
    });
});

app.post('/api/posts', (req, res) => {
    const newPost = req.body;
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data');
        }
        const posts = JSON.parse(data);
        posts.push(newPost);
        fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing data');
            }
            res.status(201).send('Post saved');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
