<template>
    <div>
        <List justify-content="center" align-items="center">
            <InputSearch placeholder="请输入想要查询的用户名称" v-model:value="WhatSearch" @search="onSearch" style="width: 50%;" size="large" enter-button>
            </InputSearch>
        </List>
        <Table :data-source="tempCS" :columns="columns">
            <template #bodyCell="{ record, column, text }">
                <template
                    v-if="typeof column.dataIndex === 'string' && ['customerNum', 'customerName', 'customerTelNum', 'customerGender', 'customerGender', 'IsMember'].includes(column.dataIndex)">
                    <div>
                        <Input v-if="editableData[record.key]"
                            v-model:value="editableData[record.key]![column.dataIndex as keyof Customer]"></Input>
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
import { Input, InputSearch, Table } from 'ant-design-vue';
import type { Data } from 'ant-design-vue/es/_util/type';
import type { DataIndex } from 'ant-design-vue/es/vc-table/interface';
import { reactive, ref } from 'vue';
//数据信息
interface Customer {
    key: string,
    customerNum: string,
    customerName: string,
    customerTelNum: string,
    customerGender: string,
    IsMember: string,
}
const customers = ref<Customer[]>([
    {
        key: '1',
        customerNum: 'C001',
        customerName: '张伟',
        customerTelNum: '13812345678',
        customerGender: '男',
        IsMember: '是'
    },
    {
        key: '2',
        customerNum: 'C002',
        customerName: '李娜',
        customerTelNum: '13798765432',
        customerGender: '女',
        IsMember: '否',
    },
    {
        key: '3',
        customerNum: 'C003',
        customerName: '王磊',
        customerTelNum: '13955551234',
        customerGender: '男',
        IsMember: '是',
    },
    {
        key: '4',
        customerNum: 'C004',
        customerName: '赵敏',
        customerTelNum: '13666668888',
        customerGender: '女',
        IsMember: '是',
    },
    {
        key: '5',
        customerNum: 'C005',
        customerName: '刘强',
        customerTelNum: '13577774444',
        customerGender: '男',
        IsMember: '是',
    },
    {
        key: '6',
        customerNum: 'C006',
        customerName: '陈静',
        customerTelNum: '18899996666',
        customerGender: '女',
        IsMember: '是',
    },
    {
        key: '7',
        customerNum: 'C007',
        customerName: '孙浩',
        customerTelNum: '15844447777',
        customerGender: '男',
        IsMember: '否',
    },
    {
        key: '8',
        customerNum: 'C008',
        customerName: '周芳',
        customerTelNum: '18733335555',
        customerGender: '女',
        IsMember: '否',
    },
    {
        key: '9',
        customerNum: 'C009',
        customerName: '吴迪',
        customerTelNum: '13188889999',
        customerGender: '男',
        IsMember: '否',
    },
    {
        key: '10',
        customerNum: 'C010',
        customerName: '杨柳',
        customerTelNum: '15022223333',
        customerGender: '女',
        IsMember: '否',
    }])
const tempCS = ref<Customer[]>([{
    key: '1',
    customerNum: 'C001',
    customerName: '张伟',
    customerTelNum: '13812345678',
    customerGender: '男',
    IsMember: '是'
},
{
    key: '2',
    customerNum: 'C002',
    customerName: '李娜',
    customerTelNum: '13798765432',
    customerGender: '女',
    IsMember: '否',
},
{
    key: '3',
    customerNum: 'C003',
    customerName: '王磊',
    customerTelNum: '13955551234',
    customerGender: '男',
    IsMember: '是',
},
{
    key: '4',
    customerNum: 'C004',
    customerName: '赵敏',
    customerTelNum: '13666668888',
    customerGender: '女',
    IsMember: '是',
},
{
    key: '5',
    customerNum: 'C005',
    customerName: '刘强',
    customerTelNum: '13577774444',
    customerGender: '男',
    IsMember: '是',
},
{
    key: '6',
    customerNum: 'C006',
    customerName: '陈静',
    customerTelNum: '18899996666',
    customerGender: '女',
    IsMember: '是',
},
{
    key: '7',
    customerNum: 'C007',
    customerName: '孙浩',
    customerTelNum: '15844447777',
    customerGender: '男',
    IsMember: '否',
},
{
    key: '8',
    customerNum: 'C008',
    customerName: '周芳',
    customerTelNum: '18733335555',
    customerGender: '女',
    IsMember: '否',
},
{
    key: '9',
    customerNum: 'C009',
    customerName: '吴迪',
    customerTelNum: '13188889999',
    customerGender: '男',
    IsMember: '否',
},
{
    key: '10',
    customerNum: 'C010',
    customerName: '杨柳',
    customerTelNum: '15022223333',
    customerGender: '女',
    IsMember: '否',
}])
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
const editableData = reactive<Record<string, Customer | undefined>>({})

const edit = (key: string) => {
    const row = customers.value.find(item => key === item.key)
    editableData[key] = JSON.parse(JSON.stringify(row))
}
const save = (key: string) => {
    const row = customers.value.find(item => key === item.key)
    if (row) Object.assign(row, editableData[key]);
    delete editableData[key];
};
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