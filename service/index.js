const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const port = 8887;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//epc文件导入
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

//epc文件导出
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

//盘点文件导入
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

//盘点文件导出
app.get('/goods/check/out', async (req, res) => {
    try {
        let query = req.query;
        let fileName = query.fileName;
        let buffer = fs.readFileSync('check/' + fileName + '.txt');
        let string = buffer.toString();
        console.log(string)
        let array = JSON.parse(string)
        console.log(array)
        res.send({ code: 1, message: 'success', data: array });
    } catch (err) {
        console.log(err)
        res.status(500).send('请求失败');
    }
})

//获取所有盘点文件名称
app.get('/goods/check/getAll', async (req, res) => {
    try {
        let array = fs.readdirSync('check/');
        for (let i = 0; i < array.length; i++) {
            let string = array[i];
            let test = string.split('.');
            array[i] = test[0];
        }
        array = array.reverse();
        res.send({ code: 1, message: 'success', data: array });
    } catch (err) {
        res.status(500).send('请求失败');
    }
})

//删除盘点文件
app.post('/goods/check/delete', async (req, res) => {
    try {
        let deleteList = req.body;
        let array = fs.readdirSync('check/');
        if (!deleteList || deleteList.length <= 0) {
            throw { message: "删除列表不能为空" }
        }
        for (let a = 0; a < deleteList.length; a++) {
            if (array.indexOf(deleteList[a] + '.txt') == -1) {
                throw { message: deleteList[a] + "文件查找失败，删除失败" }
            }
        }
        for (let i = 0; i < deleteList.length; i++) {
            fs.unlinkSync('check/' + deleteList[i] + '.txt', (err) => {
                if (err) throw { message: '删除' + deleteList[i] + '文件时失败' };
            });
        }
        res.send({ code: 1, message: 'success' })
    } catch (err) {
        if (res.statusCode != 408) { res.status(500).send(err.message); }

    }
})

app.listen(port, () => {
    console.log("服务已启动，端口号：" + port);
})