<template>
    <div>
        <List justify-content="center" align-items="center">
            <InputSearch class="top_Inputsearch" placeholder="请输入想要查询的用户名称" v-model:value="WhatSearch" @search="onSearch" "
                size="large" enter-button>
            </InputSearch>
        </List>
        <Table :data-source="tempCS" :columns="columns">
            <template #bodyCell="{ record, column, text }">
                <template
                    v-if="typeof column.dataIndex === 'string' && ['customerNum', 'customerName', 'customerTelNum', 'customerGender', 'customerGender', 'IsMember'].includes(column.dataIndex)">
                    <div>
                        <Input v-if="editableData[record.key]"
                            v-model:value="editableData[record.key]![column.dataIndex as keyof CustomerTable]"></Input>
                        <span v-else>{{ text }}</span>
                    </div>
                </template>
                <template v-if="column.dataIndex === 'edit'">
                    <div class="editable-row-operations">
                        <span v-if="editableData[record.key]">
                            <a @click="save(record.key)">保存</a>
                            <a @click="cancel(record.key)">取消</a>
                        </span>
                        <span v-else>
                            <a @click="edit(record.key)">编辑</a>
                        </span>
                    </div>
                </template>
            </template>
        </Table>
    </div>
</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import type { CustomerTable } from '@/util/type';
import { Input, InputSearch, message, Table } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, reactive, ref } from 'vue';
const customers = ref<CustomerTable[]>([])
const tempCS = ref<CustomerTable[]>([])
onMounted(async () => {
    const result = await axios.get('http://localhost:3000/api/customers')

    const arr: CustomerTable[] = result.data.map((item: any) => ({
        key: item['顾客号'],
        customerNum: item['顾客号'],
        customerName: item['姓名'],
        customerTelNum: item['电话号码'],
        customerGender: item['性别'],
        IsMember: item['会员状态']
    }))

    customers.value = arr
    tempCS.value = arr
})

const columns = [
    { title: '客户编号', dataIndex: 'customerNum', key: 'customerNum', width: 150 },
    { title: '客户姓名', dataIndex: 'customerName', key: 'customerName', width: 150 },
    { title: '联系电话', dataIndex: 'customerTelNum', key: 'customerTelNum', width: 180 },
    { title: '客户性别', dataIndex: 'customerGender', key: 'customerGender', width: 100 },
    { title: '是否会员', dataIndex: 'IsMember', key: 'IsMember', width: 120 },
    {
        title: '编辑',
        dataIndex: 'edit',
        key: 'edit',
        width: 200,
        fixed: 'right' as 'right'
    }
]
const WhatSearch = ref('')
const editableData = reactive<Record<string, CustomerTable | undefined>>({})

const edit = (key: string) => {
    const row = customers.value.find(item => key === item.key)
    editableData[key] = JSON.parse(JSON.stringify(row))
}
const save = async (key: string) => {
    // 获取包含最新更改的编辑数据
    const editedData = editableData[key]
    if (!editedData) return

    // 找到原始数据行，用于本地更新（必须在发送请求前找到）
    const originalRow = customers.value.find(item => key === item.key)
    if (!originalRow) return

    try {
        // ✅ 关键修复：PUT 请求使用 editedData 中的最新值
        const result = await axios.put("http://localhost:3000/api/customers/" + originalRow.customerNum, {
            姓名: editedData.customerName,
            电话号码: editedData.customerTelNum,
            性别: editedData.customerGender,
            会员状态: editedData.IsMember
        })
        
        console.log("PUT 请求响应:", result);
        
        // 成功后，将新数据合并回原始数组和显示数组
        Object.assign(originalRow, editedData)
        // 如果 tempCS 是筛选后的结果，它应该引用 originalRow，但为了安全，重新赋值
        const tempRow = tempCS.value.find(item => key === item.key)
        if (tempRow) {
            Object.assign(tempRow, editedData)
        }
        
        delete editableData[key]
        message.success('修改成功')
    } catch(err) {
        console.error("更新失败:", err)
        message.error('修改失败')
    }
}
const cancel = (key: string) => {
    delete editableData[key];
};
const onSearch = () => {
    const result = customers.value.filter((item) => {
        return item.customerName.includes(WhatSearch.value)
    })
    tempCS.value = JSON.parse(JSON.stringify(result))
}
</script>

<style lang="scss" scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>