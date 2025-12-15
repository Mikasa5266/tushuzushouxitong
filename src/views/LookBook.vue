<template>
  <div class="page-layout">
    <div class="header-action-bar">
      <div class="search-container">
        <!-- 搜索框 -->
        <div class="search-wrapper">
          <InputSearch 
            class="custom-search" 
            placeholder="请输入您想查询的图书名或作者" 
            enter-button="搜索" 
            v-model:value="WhatSearch" 
            size="large" 
            @search="onSearch" 
            @change="onSearch" 
            :loading="searchLoading"
          >
            <template #prefix><span style="color: #ccc;">🔍</span></template>
          </InputSearch>
        </div>
        
        <!-- 实时库存统计 -->
        <div class="search-stats" v-if="WhatSearch || tempDS.length > 0">
            <div class="stat-item"><span class="label">🔍 搜索结果:</span><span class="value">{{ tempDS.length }}</span> 本</div>
            <div class="stat-item available"><span class="label">✅ 当前可用:</span><span class="value">{{ availableCount }}</span> 本</div>
            <div class="stat-item rented"><span class="label">❌ 已租/售:</span><span class="value">{{ tempDS.length - availableCount }}</span> 本</div>
        </div>
      </div>

      <!-- 按钮组 -->
      <div class="action-buttons">
          <Button type="default" size="large" @click="exportData" style="margin-right: 10px;">
            📤 导出 Excel
          </Button>
          <Button type="primary" size="large" @click="openAddBookModal" class="add-btn">
            ➕ 批量入库
          </Button>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="table-card">
      <Table 
        :data-source="tempDS" 
        :columns="columns" 
        :scroll="{ x: 'max-content' }" 
        :pagination="{ pageSize: 8 }"
        :loading="tableLoading"
        row-key="key"
      >
        <template #bodyCell="{ column, text, record }">
          <!-- 编辑模式 -->
          <template v-if="editableData[record.key]">
            <div v-if="column.dataIndex === 'bookStatus'">
              <Select v-model:value="editableData[record.key]!.bookStatus" style="width: 100%">
                <SelectOption value="空闲">空闲</SelectOption>
                <SelectOption value="已租">已租</SelectOption>
                <SelectOption value="已售">已售</SelectOption>
              </Select>
            </div>
            <div v-else-if="column.dataIndex === 'bookKind'">
              <Select v-model:value="editableData[record.key]!.bookKind" style="width: 100%">
                <SelectOption v-for="(code, name) in kindMap" :key="code" :value="name">{{ name }}</SelectOption>
              </Select>
            </div>
            <div v-else-if="['bookId', 'bookName', 'bookAuthor', 'bookPrice'].includes(column.dataIndex as string)">
              <Input v-model:value="editableData[record.key]![column.dataIndex as keyof BookTable]" />
            </div>
            <div v-else-if="column.dataIndex === 'bookDetails'">
               <Input.TextArea v-model:value="editableData[record.key]!.bookDetails" :auto-size="{ minRows: 1, maxRows: 4 }" placeholder="请输入简介" />
            </div>
            <div v-else-if="column.dataIndex === 'edit'" class="editable-row-operations">
                <span v-if="savingKey === record.key" style="color: #1890ff;"><span class="loading-dots">保存中</span></span>
                <span v-else>
                  <a @click="save(record.key)">保存</a>
                  <a @click="cancel(record.key)">取消</a>
                </span>
            </div>
          </template>

          <!-- 查看模式 -->
          <template v-else>
            <template v-if="column.dataIndex === 'bookDetails'">
              <a @click="openModal(record.bookDetails)" class="action-link">详细</a>
            </template>
            <template v-else-if="column.dataIndex === 'bookStatus'">
                <span :class="['status-tag', getStatusClass(text)]">{{ text }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'bookPrice'">
                <span style="color: #f5222d; font-weight: bold;">￥{{ text }}</span>
            </template>
            <template v-else-if="column.dataIndex === 'edit'">
              <div class="editable-row-operations">
                <span>
                  <a @click="edit(record.key)" class="edit-btn">编辑</a>
                  <span style="margin: 0 8px; color: #e5e7eb;">|</span>
                  <Popconfirm title="确定要删除这本书吗？此操作不可逆。" ok-text="确定" cancel-text="取消" @confirm="deleteBook(record.key)">
                    <a style="color: #ff4d4f;">删除</a>
                  </Popconfirm>
                </span>
              </div>
            </template>
            <template v-else>{{ text }}</template>
          </template>
        </template>
      </Table>
    </div>

    <!-- 详情弹窗 -->
    <Modal title="图书详细" :footer="null" v-model:open="open" centered>
      <div style="padding: 20px; line-height: 1.6; color: #555; white-space: pre-wrap;">{{ currentDetails || '暂无简介' }}</div>
    </Modal>

    <!-- 新增书籍弹窗 -->
    <Modal v-model:open="addBookModalVisible" title="➕ 批量入库新书" @ok="handleAddBook" @cancel="addBookModalVisible = false" centered width="600px" okText="确认添加" cancelText="取消">
      <Form layout="vertical" class="add-form">
        <div class="form-row">
            <FormItem label="书籍名称" required style="flex: 2"><Input v-model:value="newBook.bookName" placeholder="输入书名" /></FormItem>
            <FormItem label="作者" required style="flex: 1"><Input v-model:value="newBook.bookAuthor" placeholder="输入作者" /></FormItem>
        </div>
        <div class="form-row">
            <FormItem label="类型" required>
                <Select v-model:value="newBook.bookKindCode" placeholder="选择类型" style="width: 100%">
                    <SelectOption v-for="(code, name) in kindMap" :key="code" :value="code">{{ name }}</SelectOption>
                </Select>
            </FormItem>
            <FormItem label="单价" required><Input v-model:value="newBook.bookPrice" type="number" prefix="￥" /></FormItem>
            <FormItem label="入库数量" required>
                <Input v-model:value="newBook.bookCount" type="number" placeholder="默认1" min="1" />
                <span style="font-size: 12px; color: #999;">系统将自动生成对应数量的唯一编号</span>
            </FormItem>
        </div>
        <FormItem label="简介"><Input.TextArea v-model:value="newBook.bookDetails" :rows="3" placeholder="输入简介 (50字以内)..." /></FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx';
import type { BookTable } from '@/util/type';
import { Input, InputSearch, message, Modal, Table, Select, SelectOption, Button, Form, FormItem, Popconfirm } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, reactive, ref, computed } from 'vue';

const kindMap = reactive<Record<string, string>>({ "小说": "FIC", "文学": "LIT", "人文社科": "HUM", "历史": "HIS", "哲学宗教": "PHI", "艺术": "ART", "传记": "BIO", "经济": "ECO", "金融投资": "FIN", "管理": "MAN", "市场营销": "MAR", "计算机": "IT", "自然科学": "SCI", "工程技术": "ENG", "医学": "MED", "教育": "EDU", "儿童绘本": "CHI", "青少年读物": "YOU", "生活家具": "LIF", "旅游地图": "TRA", });
const getStatusClass = (status: string) => { if (status === '空闲') return 'status-free'; if (status === '已租') return 'status-rented'; if (status === '已售') return 'status-sold'; return ''; }

const booksSource = ref<BookTable[]>([])
const tempDS = ref<BookTable[]>([])
const availableCount = computed(() => tempDS.value.filter(item => item.bookStatus === '空闲').length);

const tableLoading = ref(false); 
const searchLoading = ref(false); 
const savingKey = ref<string>(''); 

const addBookModalVisible = ref(false);
const newBook = reactive({ bookName: '', bookAuthor: '', bookKindCode: undefined, bookPrice: '', bookDetails: '', bookCount: 1 });

const openAddBookModal = () => { newBook.bookName = ''; newBook.bookAuthor = ''; newBook.bookKindCode = undefined; newBook.bookPrice = ''; newBook.bookDetails = ''; newBook.bookCount = 1; addBookModalVisible.value = true; };

const handleAddBook = async () => { 
    if (!newBook.bookName || !newBook.bookKindCode || !newBook.bookPrice || !newBook.bookAuthor) { message.warning('请填写所有必填项'); return; } 
    try { 
        await axios.post('http://localhost:3000/api/books', { 
            书籍名: newBook.bookName, 
            书籍作者: newBook.bookAuthor, 
            书籍简介: newBook.bookDetails, 
            书籍单价: parseFloat(newBook.bookPrice), 
            书籍类型代码: newBook.bookKindCode, 
            库存: newBook.bookCount 
        }); 
        message.success(`成功入库 ${newBook.bookCount} 本`); 
        addBookModalVisible.value = false; 
        fetchData(); 
    } catch (error: any) { 
        console.error(error); 
        const errorMsg = error.response?.data?.error || '添加失败'; 
        message.error(errorMsg); 
    } 
};

const fetchData = async () => { 
    tableLoading.value = true; 
    try { 
        const DS: BookTable[] = []; 
        const result = await axios.get('http://localhost:3000/api/books'); 
        const realTypes: Record<string, string> = {}; 
        
        for (let i = 0; i < result.data.length; i++) { 
            const item = result.data[i]; 
            if (item['书籍类型'] && item['书籍类型代码']) { 
                realTypes[item['书籍类型']] = item['书籍类型代码']; 
            } 
            DS.push({ 
                key: item['书籍号'], 
                bookId: item['书籍号'], 
                bookName: item['书籍名'], 
                bookStatus: item['书籍状态'], 
                bookAuthor: item['书籍作者'], 
                bookDetails: item['书籍简介'], 
                bookKind: item['书籍类型'], 
                bookKindCode:item['书籍类型代码'], 
                bookPrice: item['书籍单价'], 
                bookCount: 1 
            }) 
        } 
        if (Object.keys(realTypes).length > 0) { Object.assign(kindMap, realTypes); } 
        booksSource.value = DS; 
        tempDS.value = DS; 
    } catch (error) { 
        message.error('数据加载失败'); console.error(error); 
    } finally { 
        tableLoading.value = false; 
    } 
}

onMounted(() => { fetchData(); })

const columns = [ 
    { title: '书籍编号', dataIndex: 'bookId', key: 'bookId', width: 140 }, 
    { title: '图书名', dataIndex: 'bookName', key: 'bookName', width: 200 }, 
    { title: '状态', dataIndex: 'bookStatus', key: 'bookStatus', width: 100 }, 
    { title: '作者', dataIndex: 'bookAuthor', key: 'bookAuthor', width: 150 }, 
    { title: '简介', dataIndex: 'bookDetails', key: 'bookDetails', width: 150 }, 
    { title: '类型', dataIndex: 'bookKind', key: 'bookKind', width: 150 }, 
    { title: '单价', dataIndex: 'bookPrice', key: 'bookPrice', width: 100 }, 
    { title: '操作', dataIndex: 'edit', key: 'edit', width: 200, fixed: 'right' as 'right' }, 
]

const WhatSearch = ref('')
const editableData = reactive<Record<string, BookTable | undefined>>({})
const open = ref(false)
const currentDetails = ref('')

const edit = (key: string) => { const row = booksSource.value.find(item => key === item.key); editableData[key] = JSON.parse(JSON.stringify(row)) }

const deleteBook = async (key: string) => { 
    const row = booksSource.value.find(item => key === item.key); 
    if (!row) return; 
    try { 
        await axios.delete(`http://localhost:3000/api/books/${row.bookId}`); 
        message.success('删除成功'); 
        booksSource.value = booksSource.value.filter(item => item.key !== key); 
        tempDS.value = tempDS.value.filter(item => item.key !== key); 
    } catch (err: any) { 
        console.error("删除失败:", err); 
        message.error(err.response?.data?.error || '删除失败，请稍后重试'); 
    } 
};

const save = async (key: string) => { 
    const row = booksSource.value.find(item => key === item.key); 
    const editedData = editableData[key]; 
    if (!row || !editedData) return; 
    savingKey.value = key; 
    try { 
        const selectedKindName = editedData.bookKind; 
        const newKindCode = kindMap[selectedKindName] || row.bookKindCode; 
        await axios.put(`http://localhost:3000/api/books/${row?.bookId}`,{ 
            书籍名: editedData.bookName, 
            书籍状态: editedData.bookStatus, 
            书籍作者: editedData.bookAuthor, 
            书籍简介: editedData.bookDetails, 
            书籍单价: editedData.bookPrice, 
            库存: 1, 
            书籍类型代码: newKindCode 
        }); 
        Object.assign(row, editedData); 
        row.bookKindCode = newKindCode; 
        delete editableData[key]; 
        message.success('修改成功') 
    } catch (error) { 
        console.error(error); message.error('修改失败') 
    } finally { 
        savingKey.value = ''; 
    } 
};

const cancel = (key: string) => { delete editableData[key]; };
const openModal = (details: string) => { open.value = true; currentDetails.value = details }

const onSearch = async () => { 
    searchLoading.value = true; 
    try { 
        const result = booksSource.value.filter((item) => { 
            return item.bookName.includes(WhatSearch.value) || item.bookAuthor.includes(WhatSearch.value) 
        }); 
        tempDS.value = JSON.parse(JSON.stringify(result)) 
    } finally { 
        searchLoading.value = false; 
    } 
}

const exportData = () => {
    const dataToExport = tempDS.value.map(item => ({
        '书籍编号': item.bookId,
        '图书名': item.bookName,
        '作者': item.bookAuthor,
        '类型': item.bookKind,
        '状态': item.bookStatus,
        '单价': item.bookPrice
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "图书列表");
    XLSX.writeFile(wb, "图书目录.xlsx");
};
</script>

<style scoped>
.page-layout { height: 100%; display: flex; flex-direction: column; }
.header-action-bar { background: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); display: flex; justify-content: space-between; align-items: center; }
.search-container { display: flex; flex-direction: column; gap: 10px; flex: 1; margin-right: 20px; }
.search-wrapper { width: 100%; max-width: 600px; }
.search-stats { display: flex; gap: 20px; font-size: 14px; color: #666; background: #f9fafb; padding: 8px 12px; border-radius: 6px; width: fit-content; border: 1px solid #e5e7eb; }
.stat-item .label { margin-right: 4px; }
.stat-item .value { font-weight: bold; font-size: 16px; margin-right: 2px; }
.stat-item.available .value { color: #10b981; }
.stat-item.rented .value { color: #ef4444; }
.add-btn { box-shadow: 0 4px 6px rgba(24, 144, 255, 0.2); }
.table-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); flex: 1; overflow: hidden; }
.status-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.status-free { background-color: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-rented { background-color: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.status-sold { background-color: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
.action-link { color: #1890ff; }
.action-link:hover { text-decoration: underline; }
.edit-btn { color: #722ed1; }
.editable-row-operations a { margin-right: 8px; }
.loading-dots::after { content: '...'; animation: loading 1.5s infinite; }
@keyframes loading { 0% { content: '.'; } 33% { content: '..'; } 66% { content: '...'; } }
.add-form .form-row { display: flex; gap: 20px; }
.add-form .form-row > div { flex: 1; }
</style>