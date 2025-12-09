const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const dbConfig = require('./dbConfig');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let pool;

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

// 1. 获取所有书籍
app.get('/api/books', async (req, res) => {
    try {
        if (!pool) await connectDB();
        // 联表查询，获取书籍类型名称 (书籍类型代码)
        const result = await pool.request().query(`
            SELECT 
                B.书籍号, B.书籍名, B.书籍状态, B.书籍作者, B.书籍简介, B.书籍单价,B.书籍类型代码,
                T.类型名称 AS 书籍类型
            FROM 书籍 B
            LEFT JOIN 书籍类型 T ON B.书籍类型代码 = T.类型代码;
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. 模糊搜索书籍 (LookBook.vue 中的 onSearch)
app.get('/api/books/search', async (req, res) => {
    const { keyword } = req.query; // 接收前端传来的 keyword 参数
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

// 3. 更新书籍信息 (LookBook.vue 中的 save)
app.put('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const { 书籍名, 书籍状态, 书籍作者, 书籍简介, 书籍单价, 书籍类型代码 } = req.body;

    try {
        if (!pool) await connectDB();

        // 假设前端在编辑时能提供 书籍类型代码 (例如 'LIT')，否则需要前端提供类型名称
        // 这里简化为直接更新主要字段
        console.log(书籍类型代码)
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
        res.json({ message: '书籍更新成功' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
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

// 5. 模糊搜索顾客 (LookUser.vue, RentService.vue 中的 onSearchC)
app.get('/api/customers/search', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        // 如果没有关键词，返回全部顾客列表
        return res.json([]);
    }
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

// 6. 更新顾客信息 (LookUser.vue 中的 save)
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
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: '更新失败：未找到该顾客号' });
        }
           
        res.json({ message: '顾客信息更新成功' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// --- 交易服务接口 (保持不变) ---

// 7. 租书接口 (POST) - 自动生成交易号
app.post('/api/rent', async (req, res) => {
    // 假设前端传递了 rentDays 字段用于预计天数
    const { customerId, bookId, rentDate, rentDays, deposit } = req.body;

    // 映射前端字段到数据库字段
    const 顾客号 = customerId;
    const 书籍号 = bookId;
    const 租借日期 = rentDate;
    const 预计天数 = rentDays;
    const 押金 = deposit;

    try {
        if (!pool) await connectDB();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // 插入租书记录 (自动生成交易号)
            const insertResult = await request
                .input('cid', sql.Char(10), 顾客号)
                .input('bid', sql.Char(12), 书籍号)
                .input('date', sql.DateTime2, 租借日期)
                .input('days', sql.Int, 预计天数)
                .input('deposit', sql.Float, 押金)
                .query(`
                    INSERT INTO 租书登记表 (顾客号, 书籍号, 租借日期, 预计天数, 押金)
                    OUTPUT inserted.交易号
                    VALUES (@cid, @bid, @date, @days, @deposit)
                `);

            const newId = insertResult.recordset[0].交易号;

            // 更新书籍状态为 '已租'
            const updateRequest = new sql.Request(transaction);
            await updateRequest
                .input('bid', sql.Char(12), 书籍号)
                .query("UPDATE 书籍 SET 书籍状态 = '已租' WHERE 书籍号 = @bid");

            await transaction.commit();
            res.json({ message: '租书成功', transactionId: newId });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. 买书接口 (POST) - 自动生成交易号
app.post('/api/buy', async (req, res) => {
    // 假设前端传递了 saleDate, salePrice, paymentStatus
    const { customerId, bookId, saleDate, salePrice, paymentStatus } = req.body;

    // 映射前端字段到数据库字段
    const 顾客号 = customerId;
    const 书籍号 = bookId;
    const 销售日期 = saleDate;
    const 销售价格 = salePrice;
    const 付款状态 = paymentStatus;

    try {
        if (!pool) await connectDB();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // 插入买书记录 (自动生成交易号)
            const insertResult = await request
                .input('cid', sql.Char(10), 顾客号)
                .input('bid', sql.Char(12), 书籍号)
                .input('date', sql.DateTime2, 销售日期)
                .input('price', sql.Float, 销售价格)
                .input('status', sql.NChar(10), 付款状态)
                .query(`
                    INSERT INTO 买书交易表 (顾客号, 书籍号, 销售日期, 销售价格, 付款状态)
                    OUTPUT inserted.交易号
                    VALUES (@cid, @bid, @date, @price, @status)
                `);

            const newId = insertResult.recordset[0].交易号;

            // 更新书籍状态为 '已售'
            const updateRequest = new sql.Request(transaction);
            await updateRequest
                .input('bid', sql.Char(12), 书籍号)
                .query("UPDATE 书籍 SET 书籍状态 = '已售' WHERE 书籍号 = @bid");

            await transaction.commit();
            res.json({ message: '买书成功', transactionId: newId });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 9. 获取租书账单 (视图)
app.get('/api/bills/rent', async (req, res) => {
    try {
        if (!pool) await connectDB();
        const result = await pool.request().query('SELECT * FROM 租书结账单');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. 获取买书账单 (视图)
app.get('/api/bills/buy', async (req, res) => {
    try {
        if (!pool) await connectDB();
        const result = await pool.request().query('SELECT * FROM 买书结账单');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 后端服务器运行在 http://localhost:${PORT}`);
});