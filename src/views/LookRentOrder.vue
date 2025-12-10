<template>
    <Table :columns="columns" :data-source="tempsource">
    </Table>
</template>
<script setup lang="ts">
import { datetransform } from '@/util/datetransform';
import type { rentOrderTabel } from '@/util/type';
import { Input, Table } from 'ant-design-vue';
import { titleProps } from 'ant-design-vue/es/typography/Title';
import axios from 'axios';
import { onMounted, reactive, ref, renderSlot } from 'vue';
//设置列属性
const columns = [
    { title: '订单号', dataIndex: 'orderId', key: 'orderId', width: 100 },
    { title: '客户号', dataIndex: 'customerId', key: 'customerId', width: 200 },
    { title: '书籍号', dataIndex: 'bookId', key: 'customerName', wdith: 100 },
    { title: '顾客姓名', dataIndex: 'customerName', key: 'customerName', width: 150 },
    { title: '租借日期', dataIndex: 'rentDate', key: 'rentDate', width: 400 },
    { title: '押金', dataIndex: 'deposit', key: 'deposit', width: 100 },
]
//获取订单信息
const rentOrderSource = ref<rentOrderTabel[]>()
const tempsource = ref<rentOrderTabel[]>()
onMounted(async () => {
    const result = await axios.get('http://localhost:3000/api/bills/rent')
    console.log(result)
    const arr: rentOrderTabel[] = result.data.map((item: any) => ({
        key: item['交易号'],
        orderId: item['交易号'],
        customerId: item['顾客号'],
        customerName: item['姓名'],
        bookId: item['书籍号'],
        rentDate: datetransform(item['租借日期']),
        deposit: item['押金']
    }))
    tempsource.value = arr
    rentOrderSource.value = arr
    console.log(arr)
})
</script>