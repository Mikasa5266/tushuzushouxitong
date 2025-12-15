<template>
    <List justify-content="center" align-items="center">
        <InputSearch class="top_Inputsearch" size="large" placeholder="请输入想查询的相关订单信息" enter-button @search="onSearch"
            v-model:value="WhatSearch">
        </InputSearch>
    </List>
    <Table :columns="columns" :data-source="tempsource" :scroll="{ x: 'max-content' }">
    </Table>
</template>
<script setup lang="ts">
import List from '@/components/List.vue';
import { datetransform } from '@/util/datetransform';
import type { rentOrderTabel } from '@/util/type';
import { AutoComplete, Input, InputSearch, Table } from 'ant-design-vue';
import type { autoCompleteProps } from 'ant-design-vue/es/auto-complete';
import { titleProps } from 'ant-design-vue/es/typography/Title';
import axios from 'axios';
import { onMounted, reactive, ref, renderSlot } from 'vue';
//设置列属性
const columns = [
    { title: '订单号', dataIndex: 'orderId', key: 'orderId', width: 100 },
    { title: '客户号', dataIndex: 'customerId', key: 'customerId', width: 150 },
    { title: '书籍号', dataIndex: 'bookId', key: 'customerName', width: 150 },
    { title: '顾客姓名', dataIndex: 'customerName', key: 'customerName', width: 100 },
    { title: '租借日期', dataIndex: 'rentDate', key: 'rentDate', width: 150 },
    {
        title: '押金(￥)', dataIndex: 'deposit', key: 'deposit', width: 100, customRender: ({ text }: { text: number }) => `￥${text.toFixed(2)}`
    },
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

const WhatSearch = ref('')
const onSearch = () => {
    const result = rentOrderSource.value?.filter((item) => {
        return item.bookId.includes(WhatSearch.value)
            || item.customerId.includes(WhatSearch.value)
            || item.customerName.includes(WhatSearch.value)
            || item.orderId.includes(WhatSearch.value)
            || item.rentDate.includes(WhatSearch.value)
    })
    console.log(result)
    tempsource.value = JSON.parse(JSON.stringify(result))
}
</script>