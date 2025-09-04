import express from 'express';
import { db } from './db';
import fs from 'fs';
import path from 'path';
import { User } from './db/models/User';
import { sha256 } from 'common-lib/api-lib/sha256';
import { Category } from './db/models/Category';
import { Type } from './db/models/Type';
import { base128ToNum, toBase128 } from 'common-lib/base128';
import { scheduleHourlyCheck } from './word/get-daily-words';

const app = express();
app.use(express.json());

globalThis.app = app;
globalThis.db = db;

const apiPath = path.resolve(__dirname, 'api');

const requireAllJsFiles = (dir: string) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            requireAllJsFiles(fullPath);
        } else if (stat.isFile() && file.endsWith('.js')) {
            require(fullPath);
        }
    }
};

requireAllJsFiles(apiPath);

const main = async () => {
    await db.sync();

    if ((await User.count()) == 0) {
        await User.create({
            name: 'root',
            passwordHash: await sha256('123456'),
            valid: true,
        });
        console.log('创建根用户');
    }

    if ((await Type.count()) == 0) {
        const type = await Type.create({
            end: '',
            description: '名词',
        });
        await Category.create({
            typeId: type.id,
            value: 'hajy',
            compareValue: base128ToNum(toBase128('hajy')),
            description: '哈希语',
        });
        console.log('创建初始词库');
    }

    app.use(/.*/, (req, res) => {
        console.log(`未处理的请求: ${req.method} ${req.originalUrl}`);
        res.status(404).json({
            error: 'Not Found',
            message: `路径 ${req.originalUrl} 不存在`,
            method: req.method,
            path: req.originalUrl,
        });
    });

    scheduleHourlyCheck();

    app.listen(3000, () => {
        console.log('App listening on 3000');
    });
};

main();
