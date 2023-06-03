/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const port = 80;
const express = require('express');
const request = require('request');
const router = express.Router();
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fs = require("fs")
//const mysql = require("mysql2/promise");
const db = require("./models/index.js");
const layouts = require("express-ejs-layouts");
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require("mysql2");
const path = require('path');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session);
const app = express();
const axios = require('axios');
const http = require('http');
const socket = require('socket.io');
const server = http.createServer(app);
const io = socket(server);
const SpotifyWebApi = require('spotify-web-api-node');
const client_id = '2b8b9b81bc8642eb873e8762c0a1e0e7';
const client_secret = 'e83c32946627446fb8ba119aa5c81d6e'; 
const redirect_uri = 'http://35.216.125.9/callback';
const spotifyApi = new SpotifyWebApi({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
});

require('dotenv').config();
app.use('/css', express.static('./static/css'));
app.use('/', express.static("public2"));
app.use('/js', express.static('./static/js'));
app.use(
    express.urlencoded({
        extended: true 
    })
);
app.use(express.json());
app.use(session({
    secret: 'blackzat',
    resave: false,
    saveUninitialized: true,
    store : new FileStore(),
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}));
//아래 주석된 걸 사용해서 루트 접속시 public/index.html인 스포티파이 로그인이 실행된 거였음 그래서 /login요청시에만 public/index.html 주도록 바꿈
//app.use(express.static(__dirname + '/public'))
app.use('/spotifyLogin', express.static(__dirname + '/public'))
app.use(cors())
   .use(cookieParser());

app.set("view engine", "ejs");

//Database
db.sequelize.sync();
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});
app.get('/spotifyLogin', (req,res)=>{
    console.log('spotifyLogin')
});

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

/**계
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;
	spotifyApi.setAccessToken(access_token);
	spotifyApi.setRefreshToken(refresh_token);      
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });
	res.redirect('/plimatelist');
        // we can also pass the token to the browser to make requests from there
        //res.redirect('/#' +
        //  querystring.stringify({
        //    access_token: access_token,
        //    refresh_token: refresh_token
        //  }));
     // } else {
     //   res.redirect('/#' +
     //     querystring.stringify({
     //       error: 'invalid_token'
     //     }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/',(req,res)=>{
    console.log('메인페이지 작동');
    console.log(req.session);
    if(req.session.is_logined == true){
        res.render('link',{
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
    console.log('register page');
    res.render('register');
});

app.post('/register',(req,res)=>{
    console.log('register')
    const body = req.body;
    const Sequelize = require('sequelize');
    const id = body.id;
    const pw = body.pw;
    const nickname = body.nickname;
    const name = body.name;
    const phone = body.phone;

    connection.query('select * from members where memberId=?',[id],(err,data)=>{
        if(data.length == 0){
            console.log('register complete');
            connection.query('insert into members(memberId, fullName, nickname, password, phone) values(?,?,?,?,?)',[id, name, nickname, pw, phone]);
            res.redirect('/');
        }else{
            console.log('register failed');
            res.render('existError');
        }
    });
});

// 로그인
app.get('/logInPli',(req,res)=>{
    console.log('login page');
    res.render('logInPli');
});

app.post('/logInPli',(req,res)=>{
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
		req.session.user = data[0].memberId;
                req.session.id = data[0].memberId;
                req.session.pw = data[0].password;
		req.session.nickname = data[0].nickname;
		req.session.phone = data[0].phone;
		//console.log(req.session.name);
        	//console.log(req.session.id);
   	        //console.log(req.session.nickname);
       		//console.log(req,session.phone);
                req.session.save(function(){ //세션 스토어에 적용
                    res.render('link',{ //link.ejs로 전달 
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
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        res.redirect('/'); 
    });
});

// 로그인 상태 확인하는 미들웨어
const authenticate = (req, res, next) => {
    if (req.session.is_logined) { //login O 
      next();
    } else { //login X
      res.redirect('/logInPli');
    }
};

//인증 미들웨어 아래부터 적용
app.use(authenticate);

app.get('/plimatelist', (req, res)=>{
    console.log('Plimate List');
    res.render('plimatelist', {
        is_logined: req.session.is_logined,
	name: req.session.name
    });
})

app.get('/noLink', (req,res)=>{
    console.log('no link');
    res.send('<h1> 연동하지 않았을 때의 페이지 </h1>')
})

app.get('/link', (req, res)=>{
    console.log('link');
    res.render('link', {
        is_logined: req.session.is_logined,
        name: req.session.name
    });
})

//사용자 정보 수정

//핸드폰 번호 변경
app.get('/changePhoneNumber', (req, res) => {
    res.render('changePhoneNumber');
});

app.post('/changePhoneNumber', (req, res) => {
    const body = req.body;
    const id = req.session.user; 
    const newPhoneNumber = body.newPhoneNumber;

    connection.query('UPDATE members SET phone = ? WHERE memberId = ?', [newPhoneNumber, id], (err, result) => {
        if (err) {
            console.log('Failed to update phone number:', err);
            res.render('errorPage');
        } else {
            console.log('Phone number updated successfully');
	    req.session.phone = newPhoneNumber;
            res.redirect('/profile');
        }
    });
});
//닉네임 변경
app.get('/changeNickname', (req, res) => {
    res.render('changeNickname');
});

app.post('/changeNickname', (req, res) => {
    const body = req.body;
    const id = req.session.user; 
    const newNickname = body.newNickname;

    connection.query('UPDATE members SET nickname = ? WHERE memberId = ?', [newNickname, id], (err, result) => {
        if (err) {
            console.log('Failed to update nickname:', err);
            res.render('errorPage');
        } else {
            console.log('Nickname updated successfully');
	    req.session.nickname = newNickname;
            res.redirect('/profile'); 
        }
    });
});

//비밀번호 변경
app.get('/changePassword', (req, res) => {
    res.render('changePassword');
});

app.post('/changePassword', (req, res) => {
    const body = req.body;
    const id = req.session.user;
    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;

    connection.query('SELECT * FROM members WHERE memberId = ?', [id], (err, data) => {
        if (data.length > 0) {
            if (currentPassword === data[0].password) {
                connection.query('UPDATE members SET password = ? WHERE memberId = ?', [newPassword, id], (err, result) => {
                    if (err) {
                        console.log('Failed to update password:', err);
                        res.render('errorPage');
                    } else {
                        console.log('Password updated successfully');
                        res.redirect('/profile'); 
                    }
                });
            } else {
                console.log('Current password is incorrect');
                res.render('passwordError');
            }
        } else {
            console.log('User not found');
            res.render('errorPage');
        }
    });
});

app.get('/profile', (req, res) => {
    if (req.session.is_logined) {
        const name = req.session.name;
        const id = req.session.user;
        const nickname = req.session.nickname;
        const phone = req.session.phone;
	console.log(name);
	console.log(id);
	console.log(nickname);
	console.log(phone);
        res.render('profile', { name, id, nickname, phone });
    } else {
        res.redirect('/logInPli'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
    }
});

//채팅방 생성

//고유 ID 생성 함수
function generateUniqueId() {
  const timestamp = Date.now().toString(); // 현재 시간을 문자열로 변환
  const randomString = Math.random().toString(36).substring(2, 8); // 무작위 문자열 생성
  return timestamp + randomString;
}

//채팅방 목록 저장하는 배열
let chatRooms = [];

//루트 페이지
app.get('/chatRoom', (req, res) => {
  res.render('chatRoom', { chatRooms });
});

//채팅방 생성 페이지
app.get('/createChatRoom', (req, res) => {
  res.render('createChatRoom');
});

//채팅방 생성 요청 처리
app.post('/createChatRoom', (req, res) => {
  const { name, description } = req.body;
  const chatRoom = {
    id: generateUniqueId(),
    name,
    description,
    playlistId: 1,
    owner: req.session.nickname 
  };
  chatRooms.push(chatRoom);
  res.redirect(`playlists/${chatRoom.id}`);
});

// 채팅방 접속
app.get('/chat/:roomId/:playlistId', async(req, res)=>{
    console.log('chat, playlist');
    const roomId = req.params.roomId;
    const playlistId = req.params.playlistId;
    const playlist = await spotifyApi.getPlaylist(playlistId);
    const chatRoom = chatRooms.find(room => room.id === roomId);
    const name = req.session.nickname;
    chatRoom.playlistId = playlistId;
    res.render('chatting', { chatRoom, name, playlist, playlistId });
})

// 채팅방 나가기
app.get('/leaveChatRoom/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  res.redirect('/chatRoom');
});

// 채팅방 삭제 요청 처리
app.get('/deleteChatRoom/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const index = chatRooms.findIndex(room => room.id === roomId);
  const chatRoom = chatRooms.find(room => room.id === roomId);
  if (index !== -1 && chatRoom.owner == req.session.nickname) {
    chatRooms.splice(index, 1);
    res.render('chatRoom', { chatRooms });
  } else if (index == -1) {  // 존재하지 않는 채팅방일 경우 처리
    res.redirect('/chatRoom');
  } else if (chatRoom.owner != req.session.nickname) {
    res.render('chatRoomError', { chatRooms });
  }
});

//채팅
io.sockets.on('connection',(socket)=>{
    // 새로운 사용자 접속하면 다른 소켓에게 알려주기
    socket.on('newUser', (name, roomId, users)=>{
        console.log(name + ' 님이 접속하였습니다.')
        //소켓에 이름 저장
        socket.name = name;
	socket.roomId = roomId;
	socket.join(roomId);
	// 해당 채팅방에 사용자 추가
        const chatRoom = chatRooms.find(room => room.id === roomId);
        console.log(chatRoom);
	//chatRoom.users.push(name);
        console.log(chatRoom);
        // 모든 소켓에게 전송
        io.to(roomId).emit('update', { type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.' });
    })
	
    //전송한 메시지 받기
    socket.on('message', (data)=>{
        //받은 메시지 누가 보냈는지 이름을 추가
        data.name = socket.name;
        console.log(data);
        //보낸 사람 제외한 모든 사용자에게 메시지 전송	  
        socket.to(socket.roomId).emit('update', data);
    })

    //접속 종료
    socket.on('disconnect', ()=>{
        console.log(socket.name + '님이 나가셨습니다.')
        //나간 사람 제외하고 모든 사용자에게 아래 메시지 전송
        io.to(socket.roomId).emit('update', { type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.' });
	// roomId에서 해당 소켓 제거
        socket.leave(socket.roomId);
	// 해당 채팅방에서 사용자 제거
        //const chatRoom = chatRooms.find(room => room.id === socket.roomId);
        //if (chatRoom) {
        //    chatRoom.users = chatRoom.users.filter(user => user !== socket.name);
        //    // 채팅방에 사용자가 없으면 채팅방 삭제
        //    if (chatRoom.users.length === 0) {
        //        chatRooms = chatRooms.filter(room => room.id !== chatRoom.id);
        //    }
        //}
    })
})

//플레이리스트 정보 가져오기
async function getPlaylist(playlistId) {
    try {
        const response = await spotifyApi.getPlaylist(playlistId);
        return response.body;
    } catch (error) {
        console.error('Error retrieving playlist:', error);
        throw new Error('Failed to retrieve playlist');
    }
}

//플레이리스트 목록
app.get('/playlists', async (req,res)=>{
    try {
        const playlists = await spotifyApi.getUserPlaylists();
        //console.log(playlists);
        //console.log(playlists.body.items)
        res.render('playlists', { playlists });
    } catch (error) {
        console.error('Error retrieving playlists:', error);
        res.status(500).json({ error: 'Failed to retrieve playlists' });
    }
});

//채팅방 플레이리스트 목록
app.get('/playlists/:roomId', async (req,res)=>{
    try {
        const roomId = req.params.roomId;
        const playlists = await spotifyApi.getUserPlaylists();
        //console.log(playlists);
        //console.log(playlists.body.items)
        res.render('chatPlaylists', {playlists, roomId});
    } catch (error) {
        console.error('Error retrieving playlists:', error);
        res.status(500).json({ error: 'Failed to retrieve playlists' });
    }
});

//플레이리스트 보여주기
app.get('/playlist/:playlistId', async (req,res)=>{
    const playlistId = req.params.playlistId;

    try {
        const playlist = await spotifyApi.getPlaylist(playlistId);
        //console.log(playlist);
        //console.log(playlist.body.tracks);
        //console.log(playlist.body.tracks.items);
        playlist.id = playlistId;
        res.render('playlist', { playlist });
    } catch (error) {
        console.error('Error retrieving playlist:', error);
        res.status(500).json({ error: 'Failed to retrieve playlist' });
    }
});

//채팅방 플레이리스트 보여주기
app.get('/playlist/:roomId/:playlistId', async (req,res)=>{
    const playlistId = req.params.playlistId;
    const roomId = req.params.roomId;

    try {
        const playlist = await spotifyApi.getPlaylist(playlistId);
        //console.log(playlist);
        //console.log(playlist.body.tracks);
        //console.log(playlist.body.tracks.items);
        playlist.id = playlistId;
        res.render('chatting', { playlist });
    } catch (error) {
        console.error('Error retrieving playlist:', error);
        res.status(500).json({ error: 'Failed to retrieve playlist' });
    }
});

//플레이리스트 노래 삭제하기
app.post('/playlist/:playlistId/deleteSong', async (req, res) => {
  const playlistId = req.params.playlistId;
  const trackId = req.body.trackId;
  console.log("trackId print");
  console.log(trackId);
  try {
    await spotifyApi.removeTracksFromPlaylist(playlistId, [{ uri: `spotify:track:${trackId}` }]); 
    res.redirect(`/playlist/${playlistId}`);
  } catch (error) {
    console.error('Error deleting song from playlist:', error);
    res.status(500).json({ error: 'Failed to delete song from playlist' });
  }
});

//채팅방 플레이리스트 노래 삭제하기
app.post('/playlist/:roomId/:playlistId/deleteSong', async (req, res) => {
  const playlistId = req.params.playlistId;
  const roomId = req.params.roomId;
  const trackId = req.body.trackId;
  console.log("trackId print");
  console.log(trackId);
  try {
    await spotifyApi.removeTracksFromPlaylist(playlistId, [{ uri: `spotify:track:${trackId}` }]);
    
    res.redirect(`/chat/${roomId}/${playlistId}`);
  } catch (error) {
    console.error('Error deleting song from playlist:', error);
    res.status(500).json({ error: 'Failed to delete song from playlist' });
  }
});

// 플레이리스트 생성
app.post('/createPlaylist', async (req, res) => {
    const playlistName = req.body.playlistName;

    try {
        const playlist = await spotifyApi.createPlaylist(playlistName);
	
	console.log("플레이리스트 생성");
	console.log(playlist);
	res.redirect(`/playlist/${playlist.body.id}`);
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

app.get('/createPlaylist', (req, res) => {
    res.render('createPlaylist');
});

// 플레이리스트 이름 수정하기
app.post('/playlist/:playlistId/editName', async (req, res) => {
    const playlistId = req.params.playlistId;
    const newName = req.body.newName;

    try {
        await spotifyApi.changePlaylistDetails(playlistId, { name: newName });
        res.redirect(`/playlist/${playlistId}`);
    } catch (error) {
        console.error('Error editing playlist name:', error);
        res.status(500).json({ error: 'Failed to edit playlist name' });
    }
});

//노래 검색하는 페이지 보여주기
app.get('/searchsong/:playlistId', async (req,res) => {
        const playlistId = req.params.playlistId;
	console.log("searching");
	res.render('searchBar', { playlistId });
});

//노래 검색한 결과 보여주기
app.post('/searching/:playlistId', async(req,res)=>{
        const body = req.body;
        const obj = body.search;
        const playlistId = req.params.playlistId;
        const chatRoom = chatRooms.find(playlist => playlist.playlistId === playlistId);
	if (chatRoom) {
            const roomId = chatRoom.id;
	    spotifyApi.searchTracks(obj).then(function(data){
	        const tracks = data.body.tracks.items;
	        console.log(tracks);
	        console.log(`Search track by ${obj} in tracks`);
                res.render('search', { tracks: tracks, playlistId: playlistId, roomId: roomId });
	    }
	        ,function(err){
                    console.log("something went wrong!",err);
	        });
	}
	else {
	spotifyApi.searchTracks(obj).then(function(data){
                const tracks = data.body.tracks.items;
                console.log(tracks);
                console.log(`Search track by ${obj} in tracks`);
                res.render('search', { tracks: tracks, playlistId: playlistId, roomId: 0 });
        }
                ,function(err){
                        console.log("something went wrong!",err);
                });
	}
});

//검색한 결과 중 플레이리스트에 노래 추가하기
app.post('/addtrack/:playlistId', async (req, res) => {
  const trackUri = req.body.trackUri;
  const playlistId = req.params.playlistId;
  const chatRoom = chatRooms.find(playlist => playlist.playlistId === playlistId);
  try {
    const response = await spotifyApi.addTracksToPlaylist(playlistId, [trackUri]);
    console.log('Track added to playlist:', response);
    if (chatRoom)
      res.redirect(`/chat/${roomId}/${playlistId}`);
    else 
      res.redirect(`/playlist/${playlistId}`);
  } catch (err) {
    console.error('Failed to add track to playlist:', err);
    res.json({ success: false });
  }
});

//다른 사람들 플레이리스트 검색
app.post('/searchingPli', async(req,res)=>{
        const body = req.body;
        const obj = body.searchPli;

        spotifyApi.searchPlaylists(obj).then(function(data){
        const playlists = data.body.playlists.items;
                console.log(playlists);
                console.log(`Search playlist by ${obj} in playlists`);
                res.render('findPli',{ playlists});
        }, function(err){
                console.log("something went wrong!",err);
        });
});

//채팅방에서 다른 사람들 플레이리스트 검색
app.post('/chatSearchingPli', async(req,res)=>{
        const body = req.body;
        const obj = body.chatSearchPli;
	const roomId = body.roomId;
        
	spotifyApi.searchPlaylists(obj).then(function(data){
        const playlists = data.body.playlists.items;
                console.log(playlists);
                console.log(`Search playlist by ${obj} in playlists`);
                res.render('chatFindPli',{ playlists, roomId });
        }, function(err){
                console.log("something went wrong!",err);
        });
});


server.listen(80,() => {
    console.log(`Server running on port: ${port}`);
})

/*
// 플레이어 페이지
app.get('/player', (req, res) => {
  console.log(spotifyApi.getAccessToken());
  const accessToken = spotifyApi.getAccessToken();
  res.render('player', { accessToken });
});

// 클라이언트에 Spotify SDK 정보 전달
app.get('/config', (req, res) => {
  const clientId = '2b8b9b81bc8642eb873e8762c0a1e0e7';
  const redirectUri = 'http://35.216.125.9/callback';
  const config = {
    clientId,
    redirectUri,
  };
  res.json(config);
});

//spotifyApi.setAccessToken('BQB1KQ1kmIxxYJ0DQHnPUCYHDqN3Suls2q_uZFckTSGongKR8-KyMTmTYfcrK9O3g4iuP9uwrYqK5jlg1UwA20JGxyU73lCqcgIPlG9M9z7KZBlKglcHf9xKdymbtIOwXp4n1i8UeZ0DY1PR2_kiSBFR3tLiQjl7bChxGrFQkApMhNuH_jwbBpYxGBG3qPmIALXdgM6X6cSEDBQXscPhPLd0znc');

spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
  function(data) {
    console.log('Artist albums', data.body);
  },
  function(err) {
    console.error(err);
  }
);

spotifyApi.searchPlaylists('workout')
  .then(function(data) {
    console.log('Found playlists are', data.body);
  }, function(err) {
    console.log('Something went wrong!', err);
  });

spotifyApi.addTracksToPlaylist('5ieJqeLJjjI8iJWaxeBLuK', ["spotify:track:4iV5W9uYEdYUVa79Axb7Rh", "spotify:track:1301WleyT98MSxVHPZCA6M"])
  .then(function(data) {
    console.log('Added tracks to playlist!');
  }, function(err) {
    console.log('Something went wrong!', err);
  });
*/

