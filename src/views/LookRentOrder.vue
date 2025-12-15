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
import type { rentOrderTable } from '@/util/type';
import { AutoComplete, Input, InputSearch, Table } from 'ant-design-vue';
import type { autoCompleteProps } from 'ant-design-vue/es/auto-complete';
import { titleProps } from 'ant-design-vue/es/typography/Title';
import axios from 'axios';
import { onMounted, reactive, ref, renderSlot } from 'vue';
//设置列属性
const columns = [
    { title: '订单号', dataIndex: 'orderId', key: 'orderId', width: 100 },
    { title: '客户号', dataIndex: 'customerId', key: 'customerId', width: 120 },
    { title: '书籍号', dataIndex: 'bookId', key: 'bookId', width: 150 },
    { title: '顾客姓名', dataIndex: 'customerName', key: 'customerName', width: 120 },
    { title: '租借日期', dataIndex: 'rentDate', key: 'rentDate', width: 200 },
    {
        title: '押金', 
        dataIndex: 'deposit', 
        key: 'deposit', 
        width: 120, 
        customRender: ({ text }: { text: number }) => {
            // 使用 h 函数或者 JSX 渲染更复杂的结构，这里简单返回字符串
            // Ant Design Vue 也支持 VNode，但最简单的是样式穿透或 class
            return `￥${text.toFixed(2)}`
        },
        // 添加 class 以便在 style 中设置颜色
        className: 'column-money'
    },
]
//获取订单信息
const rentOrderSource = ref<rentOrderTable[]>([])
const tempsource = ref<rentOrderTable[]>([])
onMounted(async () => {
    const result = await axios.get('http://localhost:3000/api/bills/rent')
    console.log(result)
    const arr: rentOrderTable[] = result.data.map((item: any) => ({
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
            || item.orderId.toString().includes(WhatSearch.value)
            || item.rentDate.includes(WhatSearch.value)
    })
    console.log(result)
    tempsource.value = JSON.parse(JSON.stringify(result))
}
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
    justify-content: center;
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

/* 深度选择器修改金额列颜色 */
:deep(.column-money) {
    color: #f5222d !important;
    font-weight: 600;
}
</style>