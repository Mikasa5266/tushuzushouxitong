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
                        <span style="color: #ccc;">💰</span>
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
            >
            </Table>
        </div>
    </div>
</template>
<script setup lang="ts">
import List from '@/components/List.vue';
import { datetransform } from '@/util/datetransform';
import type { saleOrderTable } from '@/util/type';
import { Table as ATable, InputSearch, Table, Button } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import * as XLSX from 'xlsx'; // 引入 xlsx

// 定义表格列属性
const columns = [
    { title: '交易号', dataIndex: 'orderId', key: 'orderId', width: 100 },
    { title: '客户号', dataIndex: 'customerId', key: 'customerId', width: 120 },
    { title: '顾客姓名', dataIndex: 'customerName', key: 'customerName', width: 120 },
    { title: '书籍号', dataIndex: 'bookId', key: 'bookId', width: 150 },
    {
        title: '销售价格',
        dataIndex: 'salePrice',
        key: 'salePrice',
        width: 120,
        customRender: ({ text }: { text: number }) => `￥${text.toFixed(2)}`,
        className: 'column-money'
    },
    {
        title: '销售日期',
        dataIndex: 'saleDate',
        key: 'saleDate',
        width: 200,
    },
]

// 数据源
const saleOrderSource = ref<saleOrderTable[]>([])
const tempsource = ref<saleOrderTable[]>([])
const WhatSearch = ref('')

// 组件挂载时获取订单信息
onMounted(async () => {
    try {
        const result = await axios.get('http://localhost:3000/api/bills/buy')

        const arr: saleOrderTable[] = result.data.map((item: any) => ({
            key: item['交易号'],
            orderId: item['交易号'],
            customerId: item['顾客号'],
            customerName: item['姓名'],
            bookId: item['书籍号'],
            saleDate: datetransform(item['销售日期']),
            salePrice: item['销售价格']
        }))

        saleOrderSource.value = arr
        tempsource.value = arr
    } catch (error) {
        console.error("获取买书订单失败:", error)
    }
})

const onSearch = () => {
    const result = saleOrderSource.value.filter((item: saleOrderTable) => {
        return item.orderId.toString().includes(WhatSearch.value) || 
               item.customerName.includes(WhatSearch.value) ||
               item.bookId.includes(WhatSearch.value)
    })
    tempsource.value = JSON.parse(JSON.stringify(result))
}

// 导出 Excel
const exportData = () => {
    const dataToExport = tempsource.value.map(item => ({
        '交易号': item.orderId,
        '客户号': item.customerId,
        '顾客姓名': item.customerName,
        '书籍号': item.bookId,
        '销售价格': item.salePrice,
        '销售日期': item.saleDate
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "销售订单");
    XLSX.writeFile(wb, "销售报表.xlsx");
};
</script>

<style scoped>
.page-layout {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.header-action-bar {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-wrapper {
    width: 600px;
}

.table-card {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    flex: 1;
    overflow: hidden;
}

.export-btn {
    background-color: #52c41a; /* Excel 绿色 */
    border-color: #52c41a;
}
.export-btn:hover {
    background-color: #73d13d;
    border-color: #73d13d;
}

:deep(.column-money) {
    color: #f5222d !important;
    font-weight: 600;
}
</style>