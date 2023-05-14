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
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
    store : new FileStore() // 세션이 데이터를 저장하는 곳
}));

app.get('/',(req,res)=>{
    console.log('메인페이지 작동');
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
app.get('/register',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('register');
});

app.post('/register',(req,res)=>{
    console.log('회원가입 하는중')
    const body = req.body;
    const Sequelize = require('sequelize');
    const id = body.id;
    const pw = body.pw;
    const nickname = body.nickname;
    const name = body.name;
    const phone = body.phone;

    connection.query('select * from members where memberId=?',[id],(err,data)=>{
        if(data.length == 0){
            console.log('회원가입 성공');
            connection.query('insert into members(memberId, fullName, nickname, password, phone, createdAt, updatedAt) values(?,?,?,?,?,?,?)',[id, name, nickname, pw, phone, '2023-05-12', '223-05-12']);
            res.redirect('/');
        }else{
            console.log('회원가입 실패');
	    res.render('existError');
        }
    });
});

// 로그인
app.get('/login',(req,res)=>{
    console.log('로그인 작동');
    res.render('login');
});

app.post('/login',(req,res)=>{
    const body = req.body;
    const id = body.id;
    const pw = body.pw;

    connection.query('select * from members where memberId=?',[id],(err,data)=>{
        // 로그인 확인
        console.log(data[0]);
        console.log(id);
        console.log(data[0].memberId);
        console.log(data[0].password);
        console.log(id == data[0].memberId);
        console.log(pw == data[0].password);
        if(id == data[0].memberId && pw == data[0].password){
            console.log('로그인 성공');
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
        }else{
            console.log('로그인 실패');
            res.render('loginError');
        }
    });
    
});

// 로그아웃
app.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/');
    });

});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
})
