const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// 智普清言 API 配置
const API_KEY = 'a88228c8820a626b';
const API_SECRET = 'adf6e3948e384e2f8b6a071c7c4c3c23';
const API_URL = 'https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_turbo/sse-invoke';

// 生成 JWT token
function generateToken() {
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
        api_key: API_KEY,
        exp: timestamp + 3600,
        timestamp: timestamp
    };

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const signature = crypto
        .createHmac('sha256', API_SECRET)
        .update(`${headerBase64}.${payloadBase64}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return `${headerBase64}.${payloadBase64}.${signature}`;
}

// 处理聊天请求
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const token = generateToken();

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                prompt: [{
                    role: "user",
                    content: message
                }],
                temperature: 0.7,
                top_p: 0.7,
                request_id: Date.now().toString(),
                incremental: false
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 提供静态文件服务
app.use(express.static('.'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 