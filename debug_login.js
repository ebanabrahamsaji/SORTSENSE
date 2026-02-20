import db from './db.js';
import bcrypt from 'bcrypt';

const email = 'ebanabraham28@gmail.com';

const [users] = await db.query('SELECT * FROM tbl_users WHERE email = ?', [email]);
if (users.length === 0) {
    console.log('❌ User NOT FOUND in database.');
} else {
    const u = users[0];
    console.log('✅ User found:');
    console.log('  ID:', u.user_id);
    console.log('  Name:', u.name);
    console.log('  Email:', u.email);
    console.log('  Role:', u.role);
    console.log('  Has password_hash:', !!u.password_hash);
    console.log('  Has profile_picture:', !!u.profile_picture);
    console.log('  Has google_id col:', 'google_id' in u);

    // Test if any common password works
    const testPasswords = ['password', '12345678', email];
    for (const p of testPasswords) {
        const match = await bcrypt.compare(p, u.password_hash || '');
        console.log(`  Password '${p}' matches: ${match}`);
    }
}

process.exit(0);
