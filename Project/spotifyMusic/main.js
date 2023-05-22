const express = require('express');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = process.env.PORT || 80;

// 정적 파일 제공을 위한 폴더 설정
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  const accessToken = await getAccessToken();

  try {
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 액세스 토큰 발급을 위한 함수
async function getAccessToken() {
  const clientId = '2b8b9b81bc8642eb873e8762c0a1e0e7';
  const clientSecret = 'e83c32946627446fb8ba119aa5c81d6e';

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to get access token');
  }
}

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
