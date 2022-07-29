const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const port = 8887;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/goods/select/in', async (req, res) => {
    try {
        let array = req.body;
        if (!array || !array.length || array.length < 1) {
            res.status(500).send({ code: -1, message: 'epc为空' });
        }
        let string = '';
        for (let i = 0; i < array.length - 1; i++) {
            string = string + array[i] + '\n';
        }
        string += array[array.length - 1];
        fs.writeFile('epc/epc.txt', string, (err) => {
            if (err) {
                throw err;
            } else {
                res.status(200).send({ code: 1, message: 'success' })
            }
        })
    } catch (err) {
        res.status(500).send('请求失败');
    }

})

app.get('/goods/select/out', async (req, res) => {
    try {
        fs.access('epc/epc.txt', fs.constants.F_OK, (err) => {
            if (err) {
                res.status(500).send({ code: -1, message: '请用户先提供epc文件' })
            } else {
                let buffer = fs.readFileSync('epc/epc.txt');
                let string = buffer.toString();
                let array = string.split('\n');
                if (res.statusCode != 408) {
                    res.send({ code: 1, message: 'success', data: array });
                }
            }
        })
    } catch (err) {
        res.status(500).send('请求失败');
    }
})

app.post('/goods/check/in', async (req, res) => {
    try {
        let json = req.body;
        let jsonString = JSON.stringify(json);
        let date = Date.now();
        fs.writeFile('check/' + date + '.txt', jsonString, (err) => {
            if (err) {
                throw err;
            } else {
                res.status(200).send({ code: 1, message: 'success' });
            }
        })
    } catch (err) {
        res.status(500).send('请求失败');
    }
})


app.get('/goods/check/out', async (req, res) => {
    try {
        let query = req.query;
        let fileName = query.fileName;
        let buffer = fs.readFileSync('check/' + fileName + '.txt');
        let string = buffer.toString();
        let json = JSON.parse(string);
        res.send({ code: 1, message: 'success', data: json });
    } catch (err) {
        res.status(500).send('请求失败');
    }
})


app.get('/goods/check/getAll', async (req, res) => {
    try {
        let array = fs.readdirSync('check/');
        for (let i = 0; i < array.length; i++) {
            let string = array[i];
            let test = string.split('.');
            array[i] = test[0];
        }
        res.send({ code: 1, message: 'success', data: array });
    } catch (err) {
        res.status(500).send('请求失败');
    }
})

app.listen(port, () => {
    console.log("服务已启动，端口号：" + port);
})