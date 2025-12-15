<template>
    <List justify-content="center" align-items="center">
        <InputSearch class="top_Inputsearch" size="large" placeholder="请输入想查询的相关订单信息" enter-button @search="onSearch"></InputSearch>
    </List>
    <Table :columns="columns" :data-source="tempsource" :scroll="{ x: 'max-content' }" >
    </Table>
</template>
<script setup lang="ts">
import List from '@/components/List.vue';
import { datetransform } from '@/util/datetransform';
import type { saleOrderTabel } from '@/util/type';
import { Table as ATable, InputSearch, Table } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, ref } from 'vue';

// 定义表格列属性
const columns = [
    { title: '交易号', dataIndex: 'orderId', key: 'orderId', width: 100 },
    { title: '客户号', dataIndex: 'customerId', key: 'customerId', width: 150 },
    { title: '顾客姓名', dataIndex: 'customerName', key: 'customerName', width: 150 },
    { title: '书籍号', dataIndex: 'bookId', key: 'bookId', width: 150 },
    {
        title: '销售价格 (￥)',
        dataIndex: 'salePrice',
        key: 'salePrice',
        width: 150,
        // 对价格进行格式化显示
        customRender: ({ text }: { text: number }) => `￥${text.toFixed(2)}`
    },
    {
        title: '销售日期',
        dataIndex: 'saleDate',
        key: 'saleDate',
        width: 250,
    },
]

// 数据源
const saleOrderSource = ref<saleOrderTabel[]>([])
const tempsource = ref<saleOrderTabel[]>([])

// 组件挂载时获取订单信息
onMounted(async () => {
    try {
        const result = await axios.get('http://localhost:3000/api/bills/buy')

        const arr: saleOrderTabel[] = result.data.map((item: any) => ({
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

</script>

<style scoped>
.table-container {
    padding: 0;
    /* 允许表格占据整个父容器 */
    overflow-x: auto;
    /* 允许表格在容器内滚动 */
}
</style>