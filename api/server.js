const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const dbConfig = require('./dbConfig');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let pool;

// === 辅助函数：记录操作日志 ===
async function logOperation(type, content) {
    try {
        if (!pool) await connectDB();
        // 确保数据库中有 [操作日志] 表
        await pool.request()
            .input('type', sql.NVarChar(50), type)
            .input('content', sql.NVarChar(sql.MAX), content)
            .query("INSERT INTO 操作日志 (操作类型, 操作内容) VALUES (@type, @content)");
    } catch (err) {
        console.error("日志记录失败 (请确保数据库已创建[操作日志]表):", err.message);
    }
}

async function connectDB() {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ 已成功连接到 SQL Server [manage] 数据库');
    } catch (err) {
        console.error('❌ 数据库连接失败:', err);
    }
}

connectDB();

// ================= API 路由 =================

// --- 书籍相关接口 ---

// 1. 获取所有书籍 (已移除 B.库存)
app.get('/api/books', async (req, res) => {
    try {
        if (!pool) await connectDB();
        const result = await pool.request().query(`
            SELECT 
                B.书籍号, B.书籍名, B.书籍状态, B.书籍作者, B.书籍简介, B.书籍单价, B.书籍类型代码,
                T.类型名称 AS 书籍类型
            FROM 书籍 B
            LEFT JOIN 书籍类型 T ON B.书籍类型代码 = T.类型代码
            ORDER BY B.书籍号 ASC;
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. 模糊搜索书籍 (已移除 B.库存)
app.get('/api/books/search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: '缺少 keyword 参数' });
    }

    try {
        if (!pool) await connectDB();
        const result = await pool.request()
            .input('searchKeyword', sql.NVarChar, `%${keyword}%`)
            .query(`
                SELECT 
                    B.书籍号, B.书籍名, B.书籍状态, B.书籍作者, B.书籍简介, B.书籍单价,
                    T.类型名称 AS 书籍类型
                FROM 书籍 B
                LEFT JOIN 书籍类型 T ON B.书籍类型代码 = T.类型代码
                WHERE B.书籍名 LIKE @searchKeyword OR B.书籍作者 LIKE @searchKeyword;
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. 更新书籍信息 (已移除 库存 更新)
app.put('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const { 书籍名, 书籍状态, 书籍作者, 书籍简介, 书籍单价, 书籍类型代码 } = req.body;

    try {
        if (!pool) await connectDB();
        await pool.request()
            .input('bookId', sql.Char(12), id)
            .input('bookName', sql.NVarChar(50), 书籍名)
            .input('bookStatus', sql.NVarChar(2), 书籍状态)
            .input('bookAuthor', sql.NVarChar(20), 书籍作者)
            .input('bookDetails', sql.NVarChar(50), 书籍简介)
            .input('bookPrice', sql.Float, 书籍单价)
            .input('bookKindCode', sql.Char(3), 书籍类型代码) 
            .query(`
                UPDATE 书籍 SET 
                    书籍名 = @bookName,
                    书籍状态 = @bookStatus,
                    书籍作者 = @bookAuthor,
                    书籍简介 = @bookDetails,
                    书籍单价 = @bookPrice,
                    书籍类型代码 = @bookKindCode
                WHERE 书籍号 = @bookId;
            `);
        
        logOperation('修改书籍', `修改了书籍信息 ID: ${id}`);
        res.json({ message: '书籍更新成功' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 11. 新增书籍接口 (批量入库逻辑 - 已移除库存列的插入)
app.post('/api/books', async (req, res) => {
    const { 书籍名, 书籍状态, 书籍作者, 书籍简介, 书籍单价, 书籍类型代码, 库存 } = req.body;
    // 获取入库数量，默认为 1。这个库存仅用于循环次数，不写入数据库。
    const count = parseInt(库存) || 1; 

    try {
        if (!pool) await connectDB();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. 获取当前数据库中最大的书籍号作为基准
            const request = new sql.Request(transaction);
            const idResult = await request.query("SELECT TOP 1 书籍号 FROM 书籍 ORDER BY 书籍号 DESC");
            
            let lastIdNum = 100000000000n; // 默认基准 (12位)

            if (idResult.recordset.length > 0) {
                const lastIdStr = idResult.recordset[0].书籍号.trim();
                try {
                    lastIdNum = BigInt(lastIdStr);
                } catch (e) {
                    console.warn("书籍号格式非纯数字，重置为默认基准");
                }
            }

            // 2. 循环插入 count 次 (已移除 INSERT 中的 库存 列)
            for (let i = 1; i <= count; i++) {
                const currentIdNum = lastIdNum + BigInt(i);
                const newBookId = currentIdNum.toString();

                const insertRequest = new sql.Request(transaction);
                await insertRequest
                    .input('bookId', sql.Char(12), newBookId)
                    .input('bookName', sql.NVarChar(50), 书籍名)
                    .input('bookStatus', sql.NVarChar(2), '空闲') 
                    .input('bookAuthor', sql.NVarChar(20), 书籍作者)
                    .input('bookDetails', sql.NVarChar(50), 书籍简介)
                    .input('bookPrice', sql.Float, 书籍单价)
                    .input('bookKindCode', sql.Char(3), 书籍类型代码)
                    .query(`
                        INSERT INTO 书籍 (书籍号, 书籍名, 书籍状态, 书籍作者, 书籍简介, 书籍单价, 书籍类型代码)
                        VALUES (@bookId, @bookName, @bookStatus, @bookAuthor, @bookDetails, @bookPrice, @bookKindCode)
                    `);
            }

            await transaction.commit();
            logOperation('新增书籍', `批量入库 ${count} 本《${书籍名}》`);
            res.json({ message: `成功入库 ${count} 本书籍` });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error("添加书籍失败:", err);
        res.status(500).json({ error: err.message });
    }
});

// 13. 删除书籍接口
app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!pool) await connectDB();
        await pool.request()
            .input('bookId', sql.Char(12), id)
            .query('DELETE FROM 书籍 WHERE 书籍号 = @bookId');
        logOperation('删除书籍', `删除了书籍 ID: ${id}`);
        res.json({ message: '书籍删除成功' });
    } catch (err) {
        console.error("删除书籍失败:", err);
        res.status(500).json({ error: '删除失败，该书籍可能存在相关交易记录（已租/已售），无法直接删除。' });
    }
});

// --- 顾客相关接口 ---

// 4. 获取所有顾客
app.get('/api/customers', async (req, res) => {
    try {
        if (!pool) await connectDB();
        const result = await pool.request().query('SELECT 顾客号, 姓名, 电话号码, 性别, 会员状态 FROM 顾客');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. 模糊搜索顾客
app.get('/api/customers/search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.json([]);
    try {
        if (!pool) await connectDB();
        const result = await pool.request()
            .input('searchKeyword', sql.NVarChar, `%${keyword}%`)
            .query(`
                SELECT 顾客号, 姓名, 电话号码, 性别, 会员状态 
                FROM 顾客
                WHERE 姓名 LIKE @searchKeyword OR 电话号码 LIKE @searchKeyword;
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 6. 更新顾客信息
app.put('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { 姓名, 电话号码, 性别, 会员状态 } = req.body;
    
    try {
        if (!pool) await connectDB();
        const result = await pool.request()
            .input('customerNum', sql.Char(10), id)
            .input('name', sql.NVarChar(50), 姓名)
            .input('telNum', sql.Char(11), 电话号码)
            .input('gender', sql.NVarChar(1), 性别)
            .input('isMember', sql.NVarChar(3), 会员状态)
            .query(`
                UPDATE 顾客 SET 
                    姓名 = @name,
                    电话号码 = @telNum,
                    性别 = @gender,
                    会员状态 = @isMember
                WHERE 顾客号 = @customerNum;
            `);
        if (result.rowsAffected[0] === 0) return res.status(404).json({ message: '更新失败：未找到该顾客号' });
        
        logOperation('修改用户', `修改了用户信息: ${姓名} (${id})`);
        res.json({ message: '顾客信息更新成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 12. 新增用户接口 (自动生成ID: Cxxxx)
app.post('/api/customers', async (req, res) => {
    const { 姓名, 电话号码, 性别, 会员状态 } = req.body;

    try {
        if (!pool) await connectDB();

        // 1. 获取当前最大的顾客号 (格式为 C0001, C0002 ...)
        const idResult = await pool.request().query("SELECT TOP 1 顾客号 FROM 顾客 WHERE 顾客号 LIKE 'C%' ORDER BY 顾客号 DESC");
        let newCustomerId = 'C0001'; // 默认初始值

        if (idResult.recordset.length > 0) {
            const lastId = idResult.recordset[0].顾客号.trim(); // 例如 "C0005"
            try {
                // 提取数字部分 "0005"
                const numberPart = lastId.substring(1); 
                const num = parseInt(numberPart, 10);
                if (!isNaN(num)) {
                    // 数字加1，并补零回4位
                    newCustomerId = 'C' + (num + 1).toString().padStart(4, '0');
                }
            } catch (e) {
                console.warn("顾客号格式解析失败，无法自动递增");
            }
        }

        // 2. 插入新用户
        await pool.request()
            .input('customerId', sql.Char(10), newCustomerId)
            .input('customerName', sql.NVarChar(50), 姓名)
            .input('customerTel', sql.Char(11), 电话号码)
            .input('customerGender', sql.NVarChar(1), 性别)
            .input('isMember', sql.NVarChar(3), 会员状态)
            .query(`
                INSERT INTO 顾客 (顾客号, 姓名, 电话号码, 性别, 会员状态)
                VALUES (@customerId, @customerName, @customerTel, @customerGender, @isMember)
            `);
        
        logOperation('新增用户', `添加了新用户: ${姓名} (${newCustomerId})`);
        res.json({ message: '用户添加成功', customerId: newCustomerId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 14. 删除用户接口 (注销)
app.delete('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        if (!pool) await connectDB();
        await pool.request()
            .input('customerId', sql.Char(10), id)
            .query('DELETE FROM 顾客 WHERE 顾客号 = @customerId');
        
        logOperation('注销用户', `注销了用户 ID: ${id}`);
        res.json({ message: '用户注销成功' });
    } catch (err) {
        console.error("注销用户失败:", err);
        res.status(500).json({ error: '注销失败，该用户可能存在未完成的租书/买书记录，无法直接注销。' });
    }
});

// --- 交易服务接口 ---

app.post('/api/rent', async (req, res) => {
    const { customerId, bookId, rentDate, rentDays, deposit } = req.body;
    try {
        if (!pool) await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const request = new sql.Request(transaction);
            const insertResult = await request
                .input('cid', sql.Char(10), customerId)
                .input('bid', sql.Char(12), bookId)
                .input('date', sql.DateTime2, rentDate)
                .input('days', sql.Int, rentDays)
                .input('deposit', sql.Float, deposit)
                .query(`
                    INSERT INTO 租书登记表 (顾客号, 书籍号, 租借日期, 预计天数, 押金)
                    OUTPUT inserted.交易号
                    VALUES (@cid, @bid, @date, @days, @deposit)
                `);
            const newId = insertResult.recordset[0].交易号;
            
            const updateRequest = new sql.Request(transaction);
            await updateRequest
                .input('bid', sql.Char(12), bookId)
                .query("UPDATE 书籍 SET 书籍状态 = '已租' WHERE 书籍号 = @bid");
            
            await transaction.commit();
            logOperation('租书', `交易号: ${newId}, 用户 ${customerId} 租借了书籍 ${bookId}`);
            res.json({ message: '租书成功', transactionId: newId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/buy', async (req, res) => {
    const { customerId, bookId, saleDate, salePrice, paymentStatus } = req.body;
    try {
        if (!pool) await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const request = new sql.Request(transaction);
            const insertResult = await request
                .input('cid', sql.Char(10), customerId)
                .input('bid', sql.Char(12), bookId)
                .input('date', sql.DateTime2, saleDate)
                .input('price', sql.Float, salePrice)
                .input('status', sql.NChar(10), paymentStatus)
                .query(`
                    INSERT INTO 买书交易表 (顾客号, 书籍号, 销售日期, 销售价格, 付款状态)
                    OUTPUT inserted.交易号
                    VALUES (@cid, @bid, @date, @price, @status)
                `);
            const newId = insertResult.recordset[0].交易号;
            
            const updateRequest = new sql.Request(transaction);
            await updateRequest
                .input('bid', sql.Char(12), bookId)
                .query("UPDATE 书籍 SET 书籍状态 = '已售' WHERE 书籍号 = @bid");
            
            await transaction.commit();
            logOperation('买书', `交易号: ${newId}, 用户 ${customerId} 购买了书籍 ${bookId}`);
            res.json({ message: '买书成功', transactionId: newId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增功能：还书接口
app.post('/api/return', async (req, res) => {
    const { orderId, bookId } = req.body;
    try {
        if (!pool) await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // 1. 更新租书登记表，标记归还时间
            await new sql.Request(transaction)
                .input('oid', sql.Int, orderId)
                .input('returnDate', sql.DateTime, new Date())
                .query("UPDATE 租书登记表 SET 归还日期 = @returnDate WHERE 交易号 = @oid");

            // 2. 更新书籍状态为 空闲
            await new sql.Request(transaction)
                .input('bid', sql.Char(12), bookId)
                .query("UPDATE 书籍 SET 书籍状态 = '空闲' WHERE 书籍号 = @bid");

            await transaction.commit();
            logOperation('还书', `交易号: ${orderId}, 书籍 ${bookId} 已归还`);
            res.json({ message: '还书成功' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 账单查询接口
app.get('/api/bills/rent', async (req, res) => {
    try {
        if (!pool) await connectDB();
        // 关键修改：关联查询以获取归还日期
        const result = await pool.request().query(`
            SELECT A.*, B.归还日期, B.预计天数
            FROM 租书结账单 A 
            LEFT JOIN 租书登记表 B ON A.交易号 = B.交易号
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bills/buy', async (req, res) => {
    try {
        if (!pool) await connectDB();
        const result = await pool.request().query('SELECT * FROM 买书结账单');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 新增功能：获取操作日志
app.get('/api/logs', async (req, res) => {
    try {
        if (!pool) await connectDB();
        const result = await pool.request().query('SELECT TOP 100 * FROM 操作日志 ORDER BY 操作时间 DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 后端服务器运行在 http://localhost:${PORT}`);
});