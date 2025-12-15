<template>
    <div class="page-container">
        <div class="card-box">
            <List justify-content="center" align-items="center">
                <h2 class="page-title">📚 图书业务办理</h2>
            </List>
            
            <div class="content-area">
                <Form>
                    <List justify-content="center" align-items="center" class="form-section">
                        <div class="section-header">
                            <h3>🔍 图书检索</h3>
                            <span class="subtitle">支持输入书籍编号、书名或作者</span>
                        </div>
                        
                        <FormItem>
                            <!-- 
                                升级点：
                                1. option.value 绑定为 bookId (唯一键)
                                2. 下拉列表展示更详细的信息
                            -->
                            <AutoComplete 
                                v-model:value="WhatSearchBook" 
                                :options="optionsB" 
                                style="width: 500px;"
                                class="custom-autocomplete"
                                @focus="handleSearchB" 
                                @select="onSelectB" 
                                @search="handleSearchB"
                            >
                                <template #option="item">
                                    <div class="option-item">
                                        <span class="book-info">
                                            <span class="book-name">《{{ item.bookName }}》</span>
                                            <span class="book-id-tag">ID: {{ item.value }}</span>
                                        </span>
                                        <span class="auth-name">{{ item.authName }}</span>
                                    </div>
                                </template>
                                <Input size="large" placeholder="请输入 书籍编号 / 书名 / 作者">
                                    <template #prefix>📖</template>
                                </Input>
                            </AutoComplete>
                        </FormItem>

                        <!-- 图书信息展示卡片 -->
                        <div class="info-card" v-if="targetBook">
                            <div class="info-grid">
                                <div class="info-item">
                                    <span class="label">书籍编号</span>
                                    <span class="value highlight-id">{{ targetBook.bookId }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">图书名</span>
                                    <span class="value highlight">{{ targetBook.bookName }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">作者</span>
                                    <span class="value">{{ targetBook.bookAuthor }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">类型</span>
                                    <span class="value tag">{{ targetBook.bookKind }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">单价</span>
                                    <span class="value price">￥{{ targetBook.bookPrice }}</span>
                                </div>
                            </div>
                        </div>
                        <!-- 未选择时的占位符 -->
                        <div class="info-card placeholder" v-else>
                            <span style="color: #9ca3af;">请搜索并选择一本具体的书籍</span>
                        </div>

                        <FormItem style="margin-top: 30px;">
                            <Button 
                                @click="openModal" 
                                type="primary" 
                                size="large" 
                                shape="round"
                                class="action-btn"
                                :disabled="!targetBook"
                            >
                                下一步：确认用户信息
                            </Button>
                        </FormItem>
                    </List>
                </Form>
            </div>
        </div>

        <!-- 弹窗部分保持不变 -->
        <Modal title="👤 用户信息确认" v-model:open="open" :footer="null" centered width="600px">
            <div class="modal-content">
                <AutoComplete v-model:value="WhatSaerchCustomer" :options="optionsC" @search="onSearchC"
                    @focus="onSearchC" @select="onSelectC" style="width: 100%; margin-bottom: 20px;">
                    <template #option="item">
                        <div class="option-item">
                            <span>{{ item.customerName }}</span>
                            <span class="tel">{{ item.customerTelnum }}</span>
                        </div>
                    </template>
                    <Input size="large" placeholder="搜索用户姓名或手机号">
                         <template #prefix>🔍</template>
                    </Input>
                </AutoComplete>
                
                <div class="user-info-box" v-if="targetCustomer">
                    <div class="user-row">
                        <span class="u-label">姓名：</span>
                        <span class="u-value">{{ targetCustomer?.customerName }}</span>
                    </div>
                    <div class="user-row">
                        <span class="u-label">手机号：</span>
                        <span class="u-value">{{ targetCustomer?.customerTelNum }}</span>
                    </div>
                    <div class="user-row">
                        <span class="u-label">会员状态：</span>
                        <span :class="['u-value', targetCustomer?.IsMember === '会员' ? 'is-member' : '']">
                            {{ targetCustomer?.IsMember }}
                        </span>
                    </div>
                </div>

                <div class="modal-actions">
                    <Button size="large" class="modal-btn rent-btn" :disabled="!targetCustomer" @click="rentBookButton">
                        📚 借书
                    </Button>
                    <Button size="large" class="modal-btn buy-btn" type="primary" :disabled="!targetCustomer" @click="buyBookButton">
                        🛒 买书
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- 付款二维码 -->
        <Modal :width="300" v-model:open="openfukuan" :footer="null" title="扫码付款" centered>
            <Space direction="vertical" align="center" style="width: 100%; padding: 20px;">
                <QRCode :value="fukuan" :size="200"></QRCode>
                <p style="color: #888;">请使用微信/支付宝扫码</p>
            </Space>
        </Modal>

        <!-- 确认租书订单弹窗 -->
        <Modal v-model:open="openRentdingdan" title="📝 确认租书订单" :footer="null" centered width="500px">
            <div class="confirm-box">
                <div class="confirm-row">
                    <span class="c-label">书籍编号</span>
                    <span class="c-value highlight-id">{{ targetBook?.bookId }}</span>
                </div>
                <div class="confirm-row">
                    <span class="c-label">书籍名称</span>
                    <span class="c-value">{{ targetBook?.bookName }}</span>
                </div>
                <div class="confirm-row">
                    <span class="c-label">租借人</span>
                    <span class="c-value">{{ targetCustomer?.customerName }}</span>
                </div>
                <div class="confirm-row">
                    <span class="c-label">租借天数</span>
                    <Select v-model:value="timeLength" style="width: 120px;" @change="handleTimeChange">
                        <Option value="1">1天</Option>
                        <Option value="3">3天</Option>
                        <Option value="5">5天</Option>
                        <Option value="7">7天</Option>
                        <Option value="15">15天</Option>
                        <Option value="30">30天</Option>
                    </Select>
                </div>
                <Divider style="margin: 12px 0;" />
                <div class="confirm-row">
                    <span class="c-label">应付押金</span>
                    <span class="c-value price-lg">￥{{ yajin }}</span>
                </div>
                <Button type="primary" block size="large" style="margin-top: 20px;" @click="submitDingdan">确认办理</Button>
            </div>
        </Modal>

        <!-- 确认购书订单弹窗 -->
        <Modal v-model:open="openBuyOrder" title="🛍️ 确认购买订单" :footer="null" centered width="500px">
            <div class="confirm-box">
                <div class="confirm-row">
                    <span class="c-label">书籍编号</span>
                    <span class="c-value highlight-id">{{ targetBook?.bookId }}</span>
                </div>
                <div class="confirm-row">
                    <span class="c-label">书籍名称</span>
                    <span class="c-value">{{ targetBook?.bookName }}</span>
                </div>
                <div class="confirm-row">
                    <span class="c-label">购买人</span>
                    <span class="c-value">{{ targetCustomer?.customerName }}</span>
                </div>
                <Divider style="margin: 12px 0;" />
                <div class="confirm-row">
                    <span class="c-label">应付金额</span>
                    <span class="c-value price-lg">￥{{ targetBook?.bookPrice }}</span>
                </div>
                <Button type="primary" block size="large" style="margin-top: 20px;" @click="submitSaleOrder">确认支付并购买</Button>
            </div>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import { AutoComplete, Button, Divider, Flex, Form, FormItem, Input, InputSearch, message, Modal, QRCode, Select, Space } from 'ant-design-vue';
import { Option } from 'ant-design-vue/es/vc-select';
import axios from 'axios';
import { computed, onMounted, reactive, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

// 接口定义
interface OptionB {
    value: string, // 这里现在存储 bookId
    bookName: string,
    authName: string,
}
interface OptionC {
    value: string,
    customerName: string,
    customerTelnum: string
}

interface Book {
    key: string
    bookId: string,
    bookName: string,
    bookStatus: string,
    bookAuthor: string,
    bookDetails: string,
    bookKind: string,
    bookPrice: number
}
interface Customer {
    key: string,
    customerNum: string,
    customerName: string,
    customerTelNum: string,
    customerGender: string,
    IsMember: string,
}

const open = ref(false)
const WhatSearchBook = ref('')
const WhatSaerchCustomer = ref('')
const optionsB = ref<OptionB[]>([])
const optionsC = ref<OptionC[]>([])

const books = ref<Book[]>([])
const targetBook = ref<Book>() // 当前选中的具体那本书

const customers = ref<Customer[]>([])
const targetCustomer = ref<Customer>()

onMounted(async () => {
    // 获取图书
    const result1 = await axios.get('http://localhost:3000/api/books')
    const thebooks: Book[] = result1.data.map((item: any) => ({
        key: item['书籍号'],
        bookId: item['书籍号'],
        bookName: item['书籍名'],
        bookStatus: item['书籍状态'],
        bookAuthor: item['书籍作者'],
        bookDetails: item['书籍简介'],
        bookKind: item['书籍类型'],
        bookKindCode: item['书籍类型代码'],
        bookPrice: item['书籍单价']
    }))
    books.value = thebooks
    
    // 获取顾客
    const result2 = await axios.get('http://localhost:3000/api/customers')
    const thecustomers: Customer[] = result2.data.map((item: any) => ({
        key: item['顾客号'],
        customerNum: item['顾客号'],
        customerName: item['姓名'],
        customerTelNum: item['电话号码'],
        customerGender: item['性别'],
        IsMember: item['会员状态']
    }))
    customers.value = thecustomers
})

// ---------------- 核心修改：图书搜索逻辑 ----------------

// 计算搜索结果：现在支持按 ID、名称、作者搜索
const getFilteredBooks = () => {
    return books.value.filter((item) => {
        const searchText = WhatSearchBook.value.trim().toLowerCase();
        if (!searchText) return false;

        const matchId = item.bookId.toLowerCase().includes(searchText);
        const matchName = item.bookName.toLowerCase().includes(searchText);
        const matchAuthor = item.bookAuthor.toLowerCase().includes(searchText);
        
        // 只能租借/购买“空闲”状态的书
        const isAvailable = item.bookStatus === '空闲';

        return (matchId || matchName || matchAuthor) && isAvailable;
    });
};

// 构造下拉选项
const handleSearchB = () => {
    const result = getFilteredBooks();
    // 限制显示数量，防止卡顿
    const limitedResult = result.slice(0, 10); 

    optionsB.value = limitedResult.map((element) => ({
        value: element.bookId, // 关键：value 绑定为唯一的 bookId
        bookName: element.bookName,
        authName: element.bookAuthor
    }));
};

// 选中逻辑：根据唯一的 bookId 查找
const onSelectB = (value: any) => { // 修复：将参数类型改为 any 以兼容 AutoComplete 的 SelectHandler
    // value 是 bookId
    const foundBook = books.value.find(item => item.bookId === value);
    if (foundBook) {
        targetBook.value = foundBook;
        WhatSearchBook.value = foundBook.bookName; // 选中后输入框显示书名
    }
}

// ---------------- 顾客搜索逻辑 ----------------
const onSelectC = (value: any) => {
    WhatSaerchCustomer.value = value
    const result = customers.value.filter((item) => {
        return item.customerTelNum.includes(WhatSaerchCustomer.value) || item.customerName.includes(WhatSaerchCustomer.value)
    })
    targetCustomer.value = result[0]
}
const onSearchC = () => {
    const result = customers.value.filter((item) => {
        return item.customerTelNum.includes(WhatSaerchCustomer.value) || item.customerName.includes(WhatSaerchCustomer.value)
    })
    const temp = ref<OptionC[]>([])
    result.forEach(element => {
        temp.value.push({
            value: element.customerName,
            customerName: element.customerName,
            customerTelnum: element.customerTelNum
        })
    });
    optionsC.value = temp.value
}

// ---------------- 业务逻辑 ----------------
const openModal = () => {
    if(!targetBook.value) {
        message.warning("请先选择图书");
        return;
    }
    open.value = true
}

const openRentdingdan = ref(false)
const timeLength = ref(1)  
const yajin = computed(() => {
    if (!targetBook.value) return 0
    return Math.round(targetBook.value.bookPrice * 1.2)
});
const handleTimeChange = () => {}

const submitDingdan = async () => {
    const now = new Date()
    try {
        await axios.post('http://localhost:3000/api/rent', {
            customerId: targetCustomer.value?.customerNum,
            bookId: targetBook.value?.bookId, // 发送唯一的 ID
            rentDate: now,
            rentDays: timeLength.value,
            deposit: yajin.value
        })
        message.success('租书成功')
        router.push('/') // 这里可以改为 router.push('/rentorder') 查看订单
    } catch(err) {
        message.error('租书失败')
    }
}

const openBuyOrder = ref(false)
const submitSaleOrder = async ()=>{
    const now = new Date()
    try {
        await axios.post('http://localhost:3000/api/buy',{
            customerId:targetCustomer.value?.customerNum,
            bookId:targetBook.value?.bookId, // 发送唯一的 ID
            saleDate:now,
            salePrice:targetBook.value?.bookPrice,
            paymentStatus:'已支付'
        })
        message.success('买书成功')
        router.push('/')
    } catch(err) {
        message.error('买书失败')
    }
}

const rentBookButton = () => {
    if (!targetBook.value) {
        message.error("请先选择图书")
    } else if (!targetCustomer.value) {
        message.error("请先选择客户信息")
    } else {
        openRentdingdan.value = true
    }
}

const buyBookButton = () => {
    if (!targetBook.value) {
        message.error("请先选择图书")
    } else if (!targetCustomer.value) {
        message.error("请先选择客户信息")
    } else {
        openBuyOrder.value = true
    }
}

const openfukuan = ref(false)
const fukuan = ref("https://www.yuanshen.com/#/")
</script>

<style scoped>
.page-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.card-box {
    width: 900px;
    max-width: 100%;
    background-color: white;
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); 
    padding: 40px;
    transition: all 0.3s ease;
}

.page-title {
    margin-bottom: 30px;
    color: #1f2937;
    font-weight: 600;
    font-size: 24px;
}

.content-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.section-header {
    margin-bottom: 20px;
    text-align: center;
}

.section-header h3 {
    margin: 0;
    color: #374151;
}

.subtitle {
    font-size: 13px;
    color: #9ca3af;
}

/* 升级：AutoComplete 下拉选项样式 */
.option-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    align-items: center;
}
.book-info {
    display: flex;
    flex-direction: column;
}
.book-name {
    font-weight: bold;
    color: #333;
}
.book-id-tag {
    font-size: 11px;
    color: #1890ff;
    background: #e6f7ff;
    padding: 1px 4px;
    border-radius: 3px;
    width: fit-content;
}
.auth-name {
    color: #888;
    font-size: 12px;
}

.info-card {
    background-color: #f9fafb;
    border-radius: 12px;
    padding: 20px;
    width: 500px;
    margin-top: 10px;
    border: 1px solid #e5e7eb;
}
.info-card.placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    background-color: #fff;
    border: 1px dashed #d1d5db;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-item .label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
}

.info-item .value {
    font-size: 15px;
    font-weight: 500;
    color: #111827;
}

.info-item .highlight {
    color: #2563eb;
    font-weight: 600;
}
.info-item .highlight-id {
    color: #d97706; /* 橙色强调ID */
    font-family: monospace;
    font-size: 16px;
    font-weight: bold;
}

.info-item .tag {
    display: inline-block;
    background: #e0f2fe;
    color: #0369a1;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    width: fit-content;
}

.info-item .price {
    color: #ef4444;
    font-size: 18px;
    font-weight: bold;
}

.action-btn {
    width: 200px;
    height: 45px;
    font-size: 16px;
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

.user-info-box {
    background: #f3f4f6;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 25px;
}

.user-row {
    display: flex;
    margin-bottom: 10px;
    font-size: 16px;
}

.u-label {
    width: 100px;
    color: #6b7280;
}

.u-value {
    font-weight: 500;
}

.is-member {
    color: #d97706; 
    font-weight: bold;
}

.modal-actions {
    display: flex;
    justify-content: space-around;
    gap: 20px;
}

.modal-btn {
    flex: 1;
    height: 50px;
    font-size: 16px;
    font-weight: bold;
}

.rent-btn {
    background-color: #ffffff;
    border: 2px solid #3b82f6;
    color: #3b82f6;
}
.rent-btn:hover:not(:disabled) {
    background-color: #eff6ff;
}

.buy-btn {
    background-color: #10b981; 
}
.buy-btn:hover {
    background-color: #059669;
}

.confirm-box {
    padding: 10px 20px;
}

.confirm-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    font-size: 16px;
}

.c-label {
    color: #6b7280;
}

.c-value {
    font-weight: 500;
}

.price-lg {
    font-size: 24px;
    color: #ef4444;
    font-weight: bold;
}
</style>