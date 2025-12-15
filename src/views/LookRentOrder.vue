<template>
    <div class="page-layout">
        <div class="header-action-bar">
            <div class="search-wrapper">
                <InputSearch 
                    class="custom-search" 
                    size="large" 
                    placeholder="请输入想查询的相关订单信息" 
                    enter-button="查询" 
                    @search="onSearch"
                    v-model:value="WhatSearch"
                >
                    <template #prefix>
                        <span style="color: #ccc;">📄</span>
                    </template>
                </InputSearch>
            </div>
            <!-- 功能 2：导出按钮 -->
            <Button type="primary" size="large" @click="exportData" class="export-btn">
                📤 导出 Excel
            </Button>
        </div>

        <div class="table-card">
            <Table 
                :columns="columns" 
                :data-source="tempsource" 
                :scroll="{ x: 1000 }" 
                :pagination="{ pageSize: 8 }"
                :row-class-name="(record) => rowClassName(record)"
            >
                <template #bodyCell="{ column, record }">
                    <!-- 状态列：显示已还或未还 -->
                    <template v-if="column.key === 'status'">
                        <Tag color="green" v-if="record.returnDate">已归还</Tag>
                        <Tag color="red" v-else-if="isOverdue(record)">已逾期</Tag>
                        <Tag color="blue" v-else>借阅中</Tag>
                    </template>

                    <!-- 操作列：还书 -->
                    <template v-if="column.key === 'action'">
                        <Popconfirm
                            v-if="!record.returnDate"
                            title="确认归还这本书吗？"
                            ok-text="确认"
                            cancel-text="取消"
                            @confirm="returnBook(record)"
                        >
                            <Button type="link" size="small">还书</Button>
                        </Popconfirm>
                        <span v-else style="color: #999;">-</span>
                    </template>
                </template>
            </Table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Button, InputSearch, Table, Tag, message, Popconfirm } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import * as XLSX from 'xlsx'; // 引入 xlsx 库

// 定义接口，修复之前的类型报错
interface RentOrder {
    key: string;
    orderId: string;
    customerId: string;
    customerName: string;
    bookId: string;
    rentDate: string;
    deposit: number;
    returnDate: string | null;
    days: number; // 预计天数
}

// 设置列属性
const columns = [
    { title: '订单号', dataIndex: 'orderId', key: 'orderId', width: 100 },
    { title: '客户号', dataIndex: 'customerId', key: 'customerId', width: 120 },
    { title: '书籍号', dataIndex: 'bookId', key: 'bookId', width: 150 },
    { title: '顾客姓名', dataIndex: 'customerName', key: 'customerName', width: 120 },
    { title: '租借日期', dataIndex: 'rentDate', key: 'rentDate', width: 150 },
    { 
        title: '押金', 
        dataIndex: 'deposit', 
        key: 'deposit', 
        width: 100, 
        customRender: ({ text }: { text: number }) => `￥${text.toFixed(2)}`,
        className: 'column-money'
    },
    { title: '状态', key: 'status', width: 100 }, // 新增状态列
    { title: '操作', key: 'action', width: 100, fixed: 'right' as 'right' }, // 新增操作列
];

const rentOrderSource = ref<RentOrder[]>([]);
const tempsource = ref<RentOrder[]>([]);
const WhatSearch = ref('');

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
};

const fetchData = async () => {
    try {
        const result = await axios.get('http://localhost:3000/api/bills/rent');
        // 将 API 返回的数据映射为 RentOrder 接口
        const arr: RentOrder[] = result.data.map((item: any) => ({
            key: item['交易号'].toString(),
            orderId: item['交易号'].toString(),
            customerId: item['顾客号'],
            customerName: item['姓名'],
            bookId: item['书籍号'],
            rentDate: formatDate(item['租借日期']),
            deposit: item['押金'],
            returnDate: item['归还日期'], 
            days: item['预计天数'] || 30 
        }));
        rentOrderSource.value = arr;
        tempsource.value = arr;
    } catch (error) {
        message.error('获取订单失败');
    }
};

onMounted(() => {
    fetchData();
});

// 功能 3：逾期判断 (参数类型显式为 any 避免报错，实际是 RentOrder)
const isOverdue = (record: any) => {
    if (record.returnDate) return false; 
    const rentTime = new Date(record.rentDate).getTime();
    const nowTime = new Date().getTime();
    const daysPassed = (nowTime - rentTime) / (1000 * 60 * 60 * 24);
    return daysPassed > record.days;
};

// 表格行样式
const rowClassName = (record: any) => {
    return isOverdue(record) ? 'overdue-row' : '';
};

// 功能 1：还书操作
const returnBook = async (record: any) => {
    try {
        await axios.post('http://localhost:3000/api/return', {
            orderId: record.orderId,
            bookId: record.bookId
        });
        message.success('还书成功');
        fetchData(); 
    } catch (error) {
        message.error('还书失败');
    }
};

// 功能 2：导出 Excel
const exportData = () => {
    const dataToExport = tempsource.value.map(item => ({
        '订单号': item.orderId,
        '书籍号': item.bookId,
        '顾客姓名': item.customerName,
        '租借日期': item.rentDate,
        '押金': item.deposit,
        '状态': item.returnDate ? '已还' : (isOverdue(item) ? '逾期' : '借阅中')
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "租书订单");
    XLSX.writeFile(wb, "租书订单报表.xlsx");
};

const onSearch = () => {
    const result = rentOrderSource.value?.filter((item) => {
        return item.bookId.includes(WhatSearch.value)
            || item.customerId.includes(WhatSearch.value)
            || item.customerName.includes(WhatSearch.value)
            || item.orderId.toString().includes(WhatSearch.value)
    })
    tempsource.value = JSON.parse(JSON.stringify(result))
}
</script>

<style scoped>
.page-layout { height: 100%; display: flex; flex-direction: column; }
.header-action-bar { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; }
.search-wrapper { width: 600px; }
.export-btn { background-color: #52c41a; border-color: #52c41a; }
.export-btn:hover { background-color: #73d13d; border-color: #73d13d; }
.table-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); flex: 1; overflow: hidden; }
:deep(.column-money) { color: #f5222d !important; font-weight: 600; }
:deep(.overdue-row) { background-color: #fff1f0; }
</style>