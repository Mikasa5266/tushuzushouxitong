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
            <!-- 新增按钮 -->
            <Button type="primary" size="large" @click="openAddUserModal" class="add-btn">
                ➕ 新增用户
            </Button>
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
                                <!-- 编辑按钮 -->
                                <a @click="handleEditClick(record.key)" class="edit-btn">编辑</a>
                                <span style="margin: 0 8px; color: #e5e7eb;">|</span>
                                <!-- 注销按钮 (Popconfirm 确认) -->
                                <Popconfirm
                                    title="确定要注销该用户吗？此操作不可逆。"
                                    ok-text="确定"
                                    cancel-text="取消"
                                    @confirm="deleteUser(record.key)"
                                >
                                    <a style="color: #ff4d4f;">注销</a>
                                </Popconfirm>
                            </span>
                        </div>
                    </template>
                </template>
            </Table>
        </div>

        <!-- 管理员权限验证弹窗 -->
        <Modal
            v-model:open="authModalVisible"
            title="🔒 管理员权限验证"
            @ok="verifyAuth"
            @cancel="authModalVisible = false"
            centered
            width="400px"
        >
            <div style="padding: 20px 0;">
                <p style="margin-bottom: 10px; color: #666;">修改或注销用户信息需要管理员权限，请输入操作密码：</p>
                <InputPassword 
                    v-model:value="adminPassword" 
                    placeholder="请输入管理员密码" 
                    size="large"
                    @pressEnter="verifyAuth"
                >
                    <template #prefix>🔑</template>
                </InputPassword>
            </div>
        </Modal>

        <!-- 新增用户弹窗 -->
        <Modal
            v-model:open="addUserModalVisible"
            title="➕ 添加新用户"
            @ok="handleAddUser"
            @cancel="addUserModalVisible = false"
            centered
            width="500px"
            okText="确认添加"
            cancelText="取消"
        >
            <Form layout="vertical" class="add-form">
                <!-- 移除用户编号输入框，因为后端会自动生成 -->
                <FormItem label="姓名" required>
                    <Input v-model:value="newUser.customerName" placeholder="输入姓名" />
                </FormItem>
                <FormItem label="电话号码" required>
                    <Input v-model:value="newUser.customerTel" placeholder="输入11位手机号" />
                </FormItem>
                <div class="form-row">
                    <FormItem label="性别" required>
                        <Select v-model:value="newUser.customerGender" placeholder="选择性别">
                            <SelectOption value="男">男</SelectOption>
                            <SelectOption value="女">女</SelectOption>
                        </Select>
                    </FormItem>
                    <FormItem label="会员状态" required>
                        <Select v-model:value="newUser.isMember" placeholder="选择状态">
                            <SelectOption value="会员">会员</SelectOption>
                            <SelectOption value="非会员">非会员</SelectOption>
                        </Select>
                    </FormItem>
                </div>
            </Form>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import type { CustomerTable } from '@/util/type';
import { Input, InputSearch, message, Table, Select, SelectOption, Modal, InputPassword, Button, Form, FormItem, Popconfirm } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, reactive, ref } from 'vue';

const customers = ref<CustomerTable[]>([])
const tempCS = ref<CustomerTable[]>([])

// 权限验证相关状态
const authModalVisible = ref(false);
const adminPassword = ref('');
const pendingKey = ref<string>(''); // 暂存待操作(编辑或删除)的行Key
const authAction = ref<'edit' | 'delete'>('edit'); // 记录当前验证是为了编辑还是删除

// ==========================================
// 🔑 管理员密码配置 (在此处修改)
const ADMIN_PWD = '123456'; 
// ==========================================

// 新增用户相关
const addUserModalVisible = ref(false);
const newUser = reactive({
    customerName: '',
    customerTel: '',
    customerGender: '男',
    isMember: '非会员'
});

const openAddUserModal = () => {
    newUser.customerName = '';
    newUser.customerTel = '';
    newUser.customerGender = '男';
    newUser.isMember = '非会员';
    addUserModalVisible.value = true;
};

const handleAddUser = async () => {
    if (!newUser.customerName || !newUser.customerTel) {
        message.warning('请填写所有必填项');
        return;
    }

    try {
        await axios.post('http://localhost:3000/api/customers', {
            姓名: newUser.customerName,
            电话号码: newUser.customerTel,
            性别: newUser.customerGender,
            会员状态: newUser.isMember
        });
        message.success('用户添加成功');
        addUserModalVisible.value = false;
        fetchData(); // 刷新列表
    } catch (error) {
        console.error(error);
        message.error('添加失败');
    }
};

const fetchData = async () => {
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
}

onMounted(() => {
    fetchData();
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
        width: 180, // 加宽以容纳删除按钮
        fixed: 'right' as 'right'
    }
]
const WhatSearch = ref('')
const editableData = reactive<Record<string, CustomerTable | undefined>>({})

// 1. 点击编辑触发验证
const handleEditClick = (key: string) => {
    pendingKey.value = key;
    authAction.value = 'edit';
    adminPassword.value = '';
    authModalVisible.value = true;
};

// 2. 点击删除触发验证 (删除也需要管理员权限)
const deleteUser = (key: string) => {
    // 这里我们先走管理员验证，如果不需要验证可直接调用 performDelete
    pendingKey.value = key;
    authAction.value = 'delete';
    adminPassword.value = '';
    authModalVisible.value = true;
};

// 3. 验证密码
const verifyAuth = () => {
    // 使用上方定义的常量 ADMIN_PWD 进行验证
    if (adminPassword.value === ADMIN_PWD) {
        authModalVisible.value = false;
        if (authAction.value === 'edit') {
            startEdit(pendingKey.value);
        } else {
            performDelete(pendingKey.value);
        }
    } else {
        message.error('密码错误，无权操作！');
        adminPassword.value = '';
    }
};

const startEdit = (key: string) => {
    const row = customers.value.find(item => key === item.key)
    editableData[key] = JSON.parse(JSON.stringify(row))
};

// 执行删除操作
const performDelete = async (key: string) => {
    const row = customers.value.find(item => key === item.key);
    if (!row) return;
    
    try {
        await axios.delete(`http://localhost:3000/api/customers/${row.customerNum}`);
        message.success('用户注销成功');
        // 从列表中移除
        customers.value = customers.value.filter(item => item.key !== key);
        tempCS.value = tempCS.value.filter(item => item.key !== key);
    } catch (err: any) {
        console.error("注销失败:", err);
        message.error(err.response?.data?.error || '注销失败，请稍后重试');
    }
};

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
    const result = customers.value.filter((item: CustomerTable) => {
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
    justify-content: space-between;
    align-items: center;
}

.search-wrapper {
    width: 500px;
}

.add-btn {
    margin-left: 20px;
    box-shadow: 0 4px 6px rgba(24, 144, 255, 0.2);
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

.add-form .form-row {
    display: flex;
    gap: 20px;
}
.add-form .form-row > div {
    flex: 1;
}
</style>