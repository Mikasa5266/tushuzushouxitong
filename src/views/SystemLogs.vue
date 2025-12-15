<template>
    <div class="page-layout">
        <div class="header-action-bar">
            <h2>📜 系统操作日志</h2>
            <Button @click="fetchLogs">🔄 刷新</Button>
        </div>

        <div class="table-card">
            <Table 
                :columns="columns" 
                :data-source="logs" 
                :pagination="{ pageSize: 10 }"
                row-key="日志号"
            >
                <template #bodyCell="{ column, text }">
                    <template v-if="column.key === '操作类型'">
                        <Tag :color="getTypeColor(text)">{{ text }}</Tag>
                    </template>
                    <template v-if="column.key === '操作时间'">
                        {{ new Date(text).toLocaleString() }}
                    </template>
                </template>
            </Table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Table, Tag, Button, message } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, ref } from 'vue';

const logs = ref([]);

const columns = [
    { title: 'ID', dataIndex: '日志号', width: 80 },
    { title: '操作人', dataIndex: '操作人', width: 100 },
    { title: '类型', dataIndex: '操作类型', key: '操作类型', width: 120 },
    { title: '详情', dataIndex: '操作内容' },
    { title: '时间', dataIndex: '操作时间', key: '操作时间', width: 200 },
];

const getTypeColor = (type: string) => {
    if (type.includes('删除') || type.includes('注销')) return 'red';
    if (type.includes('新增') || type.includes('入库')) return 'green';
    if (type.includes('修改')) return 'blue';
    return 'default';
};

const fetchLogs = async () => {
    try {
        const result = await axios.get('http://localhost:3000/api/logs');
        logs.value = result.data;
    } catch (error) {
        message.error('加载日志失败');
    }
};

onMounted(() => {
    fetchLogs();
});
</script>

<style scoped>
.page-layout {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
}
.header-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.table-card {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    flex: 1;
    overflow: auto;
}
</style>