const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')
const qs = require('qs')
let handlers = {}
let id = -1
const server = http.createServer((req, res) => {
    let parseUrl = url.parse(req.url, true)
    let pathName = parseUrl.pathname // tra ve :/home
    let trimPath = pathName.replace(/^\/+|\/+$/g, '');
    let chosenHandler
    if (typeof router[trimPath] === "undefined") {
        chosenHandler = handlers.notFound
    } else {
        chosenHandler = router[trimPath]
    }
    chosenHandler(req, res)
})

handlers.login = (req, res) => {
    if (req.method === 'GET') {
        fs.readFile('./views/login.html', 'utf-8', (err, data) => {
            res.writeHead(200, "text/html")
            res.write(data)
            res.end()
        })
    } else {
        let path = '/register'
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            let userInfo = qs.parse(data)
            let userString = fs.readFileSync('./data/user.JSON', {encoding: 'utf8', flag: 'r'})
            let users = JSON.parse(userString)
            users.forEach(item => {
                if (userInfo.name === item.name && userInfo.password === item.password) {
                    id = item.id
                    path = '/edit'
                    fs.writeFileSync('./data/tempId.JSON', id)
                }
            });
            res.writeHead(301, {'location': path})
            res.end()
        })
    }
}

handlers.home = (req, res) => {
    fs.readFile('./views/index.html', 'utf-8', (err, data) => {
        id = -1
        res.writeHead(200, "text/html")
        res.write(data)
        res.end()
    })
}

handlers.register = (req, res) => {
    if (req.method === 'GET') {
        fs.readFile('./views/register.html', 'utf-8', (err, data) => {
            res.writeHead(200, "text/html")
            res.write(data)
            res.end()
        })
    } else {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            let direction = false
            let userInfo = qs.parse(data)
            let userString = fs.readFileSync('./data/user.JSON', {encoding: 'utf8', flag: 'r'})
            let users = JSON.parse(userString)
            users.forEach(item => {
                if (item.name === userInfo.name) {
                    return direction = true
                }
            })
            switch (direction) {
                case true:
                    console.log("name has used")
                    res.writeHead(301, {'location': '/register'})
                    res.end()
                    break
                case false:
                    do {
                        id = Math.floor(Math.random() * 100)
                    } while (isCheckId(id, users))
                    let userObj = {
                        "id": `${id}`,
                        "name": userInfo.name,
                        "password": userInfo.password
                    }
                    users.push(userObj)
                    users = JSON.stringify(users)
                    fs.writeFile('./data/user.JSON', users, (err) => {
                        if (err) console.log(err)
                        console.log("write done")
                    })
                    res.writeHead(301, {'location': '/home'})
                    res.end()
                    break
            }
        })
        req.on('error', () => {
            console.log('error')
        })
    }
}

handlers.edit = (req, res) => {
    if (req.method === 'GET') {
        fs.readFile('./views/edit.html', 'utf-8', (err, data) => {
            res.writeHead(200, "text/html");
            res.write(data)
            res.end()
        })
    } else {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            console.log(id);
            let userEdit = qs.parse(data)
            let idString = fs.readFileSync('./data/tempId.JSON', {encoding: 'utf8', flag: 'r'})
            let userString = fs.readFileSync('./data/user.JSON', {encoding: 'utf8', flag: 'r'})
            let users = JSON.parse(userString)
            users.forEach(item => {
                if (idString === item.id) {
                    item.name = userEdit.name
                    item.password = userEdit.password
                }
            })
            users = JSON.stringify(users)
            fs.writeFile('./data/user.JSON', users, (err) => {
                if (err) console.log(err)
                console.log("Edit done")
            })
        })
        res.writeHead(301, {'location': '/home'})
        res.end()
        req.on('error', () => {
            console.log('error')
        })
    }
}

handlers.notFound = (req, res) => {
    fs.readFile('./views/notFound.html', 'utf-8', (err, data) => {
        res.writeHead(200, "text/html")
        res.write(data)
        res.end()
    })
}

let router = {
    'home': handlers.home,
    'login': handlers.login,
    'register': handlers.register,
    'edit': handlers.edit
}

server.listen(3000, () => {
    console.log('server running port 3000')
})

function isCheckId(id, array) {
    let flag = false
    array.forEach(item => {
        if (item.id === id) {
            flag = true
        }
    })
    return flag
}