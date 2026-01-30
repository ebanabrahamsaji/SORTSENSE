import db from './db.js';
import fs from 'fs';

async function check() {
    let output = '';
    try {
        const [fields] = await db.query('DESCRIBE tbl_pickup_requests');
        output += 'Fields in tbl_pickup_requests: ' + fields.map(f => f.Field).join(', ') + '\n';

        const [fieldsUsers] = await db.query('DESCRIBE tbl_users');
        output += 'Fields in tbl_users: ' + fieldsUsers.map(f => f.Field).join(', ') + '\n';

        fs.writeFileSync('schema_output.txt', output);
    } catch (e) {
        fs.writeFileSync('schema_output.txt', e.toString());
    }
    process.exit();
}
check();
