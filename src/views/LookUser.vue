<template>
    <div class="page-layout">
        <!-- 顶部搜索栏 -->
        <div class="header-action-bar">
            <div class="search-wrapper">
                <InputSearch 
                    class="custom-search" 
                    placeholder="请输入想要查询的用户名称" 
                    v-model:value="WhatSearch" 
                    @search="onSearch"
                    size="large" 
                    enter-button="搜索"
                >
                    <template #prefix>
                        <span style="color: #ccc;">👥</span>
                    </template>
                </InputSearch>
            </div>
        </div>

        <!-- 表格卡片 -->
        <div class="table-card">
            <Table 
                :data-source="tempCS" 
                :columns="columns" 
                :pagination="{ pageSize: 8 }"
                row-key="key"
            >
                <template #bodyCell="{ record, column, text }">
                    <template v-if="editableData[record.key]">
                        <!-- 会员状态编辑：下拉框 -->
                        <div v-if="column.dataIndex === 'IsMember'">
                            <Select v-model:value="editableData[record.key]!.IsMember" style="width: 100%">
                                <SelectOption value="会员">会员</SelectOption>
                                <SelectOption value="非会员">非会员</SelectOption>
                            </Select>
                        </div>
                        
                        <!-- 其他字段：普通输入框 -->
                        <div v-else-if="typeof column.dataIndex === 'string' && ['customerNum', 'customerName', 'customerTelNum', 'customerGender'].includes(column.dataIndex)">
                            <Input v-model:value="editableData[record.key]![column.dataIndex as keyof CustomerTable]"></Input>
                        </div>
                    </template>

                    <template v-else>
                        <!-- 非编辑状态显示 -->
                        <span v-if="column.dataIndex === 'IsMember'">
                            <span :class="text === '会员' ? 'member-tag' : 'normal-tag'">{{ text }}</span>
                        </span>
                        <span v-else>{{ text }}</span>
                    </template>

                    <template v-if="column.dataIndex === 'edit'">
                        <div class="editable-row-operations">
                            <span v-if="editableData[record.key]">
                                <a @click="save(record.key)" style="margin-right: 10px;">保存</a>
                                <a @click="cancel(record.key)" style="color: #999;">取消</a>
                            </span>
                            <span v-else>
                                <a @click="edit(record.key)" class="edit-btn">编辑</a>
                            </span>
                        </div>
                    </template>
                </template>
            </Table>
        </div>
    </div>
</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import type { CustomerTable } from '@/util/type';
import { Input, InputSearch, message, Table, Select, SelectOption } from 'ant-design-vue';
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
    { title: '是否会员', dataIndex: 'IsMember', key: 'IsMember', width: 150 }, 
    {
        title: '操作',
        dataIndex: 'edit',
        key: 'edit',
        width: 150,
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
    const editedData = editableData[key]
    if (!editedData) return

    const originalRow = customers.value.find(item => key === item.key)
    if (!originalRow) return

    try {
        const result = await axios.put("http://localhost:3000/api/customers/" + originalRow.customerNum, {
            姓名: editedData.customerName,
            电话号码: editedData.customerTelNum,
            性别: editedData.customerGender,
            会员状态: editedData.IsMember
        })
        
        Object.assign(originalRow, editedData)
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

.editable-row-operations a {
    margin-right: 8px;
}

.edit-btn {
    color: #722ed1;
}

.member-tag {
    color: #d97706; /* 金色 */
    font-weight: bold;
    background-color: #fffbeb;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #fcd34d;
}

.normal-tag {
    color: #4b5563;
    background-color: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
}
</style>