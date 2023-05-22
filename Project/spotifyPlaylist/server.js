const express = require('express');
const querystring = require('querystring');
const axios = require('axios');

const clientId = '2b8b9b81bc8642eb873e8762c0a1e0e7';
const clientSecret = 'e83c32946627446fb8ba119aa5c81d6e';
const redirectUri = 'http://35.216.125.9/callback'; // 리다이렉트 URL 설정 (실제 도메인으로 변경해야 함)

const app = express();

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

async function getAccessToken() {
  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post(
      TOKEN_ENDPOINT,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authHeader}`
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error:', error.message);
    throw new Error('Failed to obtain access token');
  }
}

app.get('/', (req, res) => {
  // 프론트엔드 파일 전송
  res.sendFile(__dirname + '/index.html');
});

app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative'; // 필요한 권한(scope) 설정

  // Spotify 로그인 페이지로 리다이렉트
  const url = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    scope,
    redirect_uri: redirectUri
  })}`;
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Access Token 요청을 위한 POST 요청
    const response = await axios.post(
      TOKEN_ENDPOINT,
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString('base64')}`
        }
      }
    );

    // Front로 Access Token 전달
    res.sendFile(__dirname + '/success.html');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.use(express.json()); // JSON 요청 본문을 파싱하기 위한 미들웨어 추가

app.post('/create-playlist', async (req, res) => {
  const { accessToken, playlistName } = req.body;
  console.log(req.body);
  console.log(accessToken);
  try {
    // 액세스 토큰이 없는 경우에만 발급
    if (!accessToken) {
      const newAccessToken = await getAccessToken();
      // 토큰 발급에 성공하면 발급된 토큰을 사용
      const createPlaylistResponse = await axios.post(
        'https://api.spotify.com/v1/me/playlists',
        {
          name: playlistName,
          public: false
        },
        {
          headers: {
            Authorization: `Bearer ${newAccessToken}`
          }
        }
      );
      res.json(createPlaylistResponse.data);
    } else {
      // 액세스 토큰이 있는 경우 바로 사용
      const createPlaylistResponse = await axios.post(
        'https://api.spotify.com/v1/me/playlists',
        {
          name: playlistName,
          public: false
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      res.json(createPlaylistResponse.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: '플레이리스트 생성에 실패했습니다.' });
  }
});

app.listen(80, () => {
  console.log('Server is running on port 80');
});
