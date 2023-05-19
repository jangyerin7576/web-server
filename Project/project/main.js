const port = 80,
  express = require("express"),
  app = express(),
  router = express.Router(),
  homeController = require("./controllers/homeController"),
  layouts = require("express-ejs-layouts"),
 // mysql = require("mysql2/promise"),
  mysql = require("mysql2"),
  db = require("./models/index");
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); 
const cookieParser = require('cookie-parser');
const http = require('http');
const socket = require('socket.io');
const server = http.createServer(app);
const io = socket(server);

app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));

require('dotenv').config();

db.sequelize.sync();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

app.set("port", process.env.PORT || 80);
app.set("view engine", "ejs");

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname,'/public')));
//app.use(layouts);
app.use(session({
    secret: 'blackzat', // 데이터를 암호화 하기 위해 필요한 옵션
    resave: false, // 요청이 왔을때 세션을 수정하지 않더라도 다시 저장소에 저장되도록
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시킨다(서버에 부담을 줄이기 위해)
    store : new FileStore() // 세션이 데이터를 저장하는 곳
}));

app.get('/',(req,res)=>{
    console.log('main page');
    console.log(req.session);
    if(req.session.is_logined == true){
        res.render('index',{
            is_logined : req.session.is_logined,
            name : req.session.name
        });
    }else{
        res.render('index',{
            is_logined : false
        });
    }
});

// 회원가입
app.get('/signUp',(req,res)=>{
    console.log('sign up page');
    res.render('signUp');
});

app.post('/signUp',(req,res)=>{
    console.log('sign up')
    const body = req.body;
    const Sequelize = require('sequelize');
    const id = body.id;
    const pw = body.pw;
    const nickname = body.nickname;
    const name = body.name;
    const phone = body.phone;

    connection.query('select * from members where memberId=?',[id],(err,data)=>{
        if(data.length == 0){
            console.log('sign up complete');
            connection.query('insert into members(memberId, fullName, nickname, password, phone) values(?,?,?,?,?)',[id, name, nickname, pw, phone]);
            res.redirect('/');
        }else{
            console.log('sign up failed');
	    res.render('existError');
        }
    });
});

// 로그인
app.get('/login',(req,res)=>{
    console.log('login page');
    res.render('login');
});

app.post('/login',(req,res)=>{
    const body = req.body;
    const id = body.id;
    const pw = body.pw;

    connection.query('select * from members where memberId=?',[id],(err,data)=>{
       // 로그인 확인
      /* 
	console.log(data[0]);
        console.log(id);
        console.log(data[0].memberId);
        console.log(data[0].password);
        console.log(id == data[0].memberId);
        console.log(pw == data[0].password);
      */ 
        if(data[0] != undefined) {
            if(id == data[0].memberId && pw == data[0].password){
                console.log('login complete');
		console.log(data[0]);
                // 세션에 추가
                req.session.is_logined = true;
                req.session.name = data[0].fullName;
                req.session.id = data[0].memberId;
                req.session.pw = data[0].password;
                req.session.save(function(){ // 세션 스토어에 적용하는 작업
                    res.render('index',{ // 정보전달
                        name : data[0].fullName,
                        id : data[0].memberId,
                        nickname : data[0].nickname,
                        is_logined : true
                    });
                });
            }
            else{
                console.log('login failed');
                res.render('loginError');
            }
	}
	else{
            console.log('login failed');
	    res.render('loginError');
	}
    });
});

// 로그아웃
app.get('/logout',(req,res)=>{
    console.log('logout complete');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/');
    });

});


// 이 파일 옮길 때 아래 sendFile 경로 바꿔줘야함
app.get('/socketio', (req, res)=>{
    console.log('채팅방');
    fs.readFile('./static/index.html', function(err, data) {
    if(err) {
        res.send('에러')
    } else {
        res.writeHead(200, {'Content-Type':'text/html'})
        res.write(data)
        res.end()
    }
  })
    //console.log('채팅방');
    //res.sendFile(__dirname + '/views/socketio.html');
})

io.sockets.on('connection', function(socket) {

  /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
  socket.on('newUser', function(name) {
    console.log(name + ' 님이 접속하였습니다.')

    /* 소켓에 이름 저장해두기 */
    socket.name = name

    /* 모든 소켓에게 전송 */
    io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })

  /* 전송한 메시지 받기 */
  socket.on('message', function(data) {
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name

    console.log(data)

    /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', data);
  })

  /* 접속 종료 */
  socket.on('disconnect', function() {
    console.log(socket.name + '님이 나가셨습니다.')

    /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
  })
})



server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
})
