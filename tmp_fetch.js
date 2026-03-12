import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secret = (process.env.JWT_SECRET || 'fallback_secret').trim().replace(/^"|"$/g, '');
const token = jwt.sign({id: 25, role: 'USER'}, secret);

fetch('http://localhost:8000/api/messages/user-center/history/97', {
    headers: { 'Authorization': 'Bearer ' + token }
})
.then(r => r.text())
.then(t => console.log(t))
.catch(e => console.error(e));
