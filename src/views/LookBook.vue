<template>
  <div class="page-layout">
    <!-- 顶部搜索区域 -->
    <div class="header-action-bar">
      <div class="search-wrapper">
        <InputSearch 
          class="custom-search" 
          placeholder="请输入您想查询的图书名或作者" 
          enter-button="搜索" 
          v-model:value="WhatSearch" 
          size="large" 
          @search="onSearch"
        >
          <template #prefix>
             <span style="color: #ccc;">🔍</span>
          </template>
        </InputSearch>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="table-card">
      <Table 
        :data-source="tempDS" 
        :columns="columns" 
        :scroll="{ x: 'max-content' }" 
        :pagination="{ pageSize: 8 }"
        row-key="key"
      >
        <template #bodyCell="{ column, text, record }">
          
          <!-- 编辑状态 -->
          <template v-if="editableData[record.key]">
            
            <!-- 1. 书籍状态改为下拉框 -->
            <div v-if="column.dataIndex === 'bookStatus'">
              <Select v-model:value="editableData[record.key]!.bookStatus" style="width: 100%">
                <SelectOption value="空闲">空闲</SelectOption>
                <SelectOption value="已租">已租</SelectOption>
                <SelectOption value="已售">已售</SelectOption>
              </Select>
            </div>

            <!-- 2. 书籍类型改为下拉框 -->
            <div v-else-if="column.dataIndex === 'bookKind'">
              <Select v-model:value="editableData[record.key]!.bookKind" style="width: 100%">
                <SelectOption v-for="(code, name) in kindMap" :key="code" :value="name">
                  {{ name }}
                </SelectOption>
              </Select>
            </div>

            <!-- 其他字段保持输入框 -->
            <div v-else-if="['bookId', 'bookName', 'bookAuthor', 'bookPrice'].includes(column.dataIndex as string)">
              <Input v-model:value="editableData[record.key]![column.dataIndex as keyof BookTable]" />
            </div>

            <!-- 操作列: 保存/取消 -->
            <div v-else-if="column.dataIndex === 'edit'" class="editable-row-operations">
                <span>
                  <a @click="save(record.key)">保存</a>
                  <a @click="cancel(record.key)">取消</a>
                </span>
            </div>

          </template>

          <!-- 非编辑状态 -->
          <template v-else>
            <template v-if="column.dataIndex === 'bookDetails'">
              <a @click="openModal(record.bookDetails)">详细</a>
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
                  <a @click="edit(record.key)">编辑</a>
                </span>
              </div>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>

        </template>
      </Table>
    </div>
    <Modal title="图书详细" :footer="null" v-model:open="open" centered>
      <div style="padding: 20px; line-height: 1.6; color: #555;">
        {{ currentDetails }}
      </div>
    </Modal>
  </div>

</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import type { BookTable } from '@/util/type';
import { Input, InputSearch, message, Modal, Table, Select, SelectOption } from 'ant-design-vue';
import axios from 'axios';
import { onMounted, reactive, ref } from 'vue';

// 图书类型映射表：中文名称 -> 类型代码
const kindMap: Record<string, string> = {
    "小说": "FIC",
    "文学": "LIT",
    "人文社科": "HUM",
    "历史": "HIS",
    "哲学宗教": "PHI",
    "艺术": "ART",
    "传记": "BIO",
    "经济": "ECO",
    "金融投资": "FIN",
    "管理": "MAN",
    "市场营销": "MAR",
    "计算机": "IT",
    "自然科学": "SCI",
    "工程技术": "ENG",
    "医学": "MED",
    "教育": "EDU",
    "儿童绘本": "CHI",
    "青少年读物": "YOU",
    "生活家具": "LIF",
    "旅游地图": "TRA",
};

// 辅助函数：状态颜色
const getStatusClass = (status: string) => {
    if (status === '空闲') return 'status-free';
    if (status === '已租') return 'status-rented';
    if (status === '已售') return 'status-sold';
    return '';
}

const booksSource = ref<BookTable[]>([])
const tempDS = ref<BookTable[]>([])

onMounted(async () => {
  const DS: BookTable[] = []
  const result = await axios.get('http://localhost:3000/api/books')
  for (let i = 0; i < result.data.length; i++) {
    const item = result.data[i]
    DS.push({
      key: item['书籍号'],
      bookId: item['书籍号'],
      bookName: item['书籍名'],
      bookStatus: item['书籍状态'],
      bookAuthor: item['书籍作者'],
      bookDetails: item['书籍简介'],
      bookKind: item['书籍类型'],
      bookKindCode:item['书籍类型代码'],
      bookPrice: item['书籍单价']
    })
  }
  
  booksSource.value = DS
  tempDS.value = DS
})

const columns = [
  { title: '书籍编号', dataIndex: 'bookId', key: 'bookId', width: 120 },
  { title: '图书名', dataIndex: 'bookName', key: 'bookName', width: 200 },
  { title: '状态', dataIndex: 'bookStatus', key: 'bookStatus', width: 120 }, 
  { title: '作者', dataIndex: 'bookAuthor', key: 'bookAuthor', width: 150 },
  { title: '简介', dataIndex: 'bookDetails', key: 'bookDetails', width: 100 },
  { title: '类型', dataIndex: 'bookKind', key: 'bookKind', width: 150 }, 
  { title: '单价', dataIndex: 'bookPrice', key: 'bookPrice', width: 100 },
  {
    title: '操作',
    dataIndex: 'edit',
    key: 'edit',
    width: 200,
    fixed: 'right' as 'right'
  },
]

//搜索框数据
const WhatSearch = ref('')
//控制可编辑数据显示
const editableData = reactive<Record<string, BookTable | undefined>>({})
//控制对话框（图书详细）显示
const open = ref(false)
const currentDetails = ref('')

//方法实现

//编辑内容
const edit = (key: string) => {
  const row = booksSource.value.find(item => key === item.key)
  editableData[key] = JSON.parse(JSON.stringify(row))
}

const save = async (key: string) => {
  const row = booksSource.value.find(item => key === item.key)
  const editedData = editableData[key]

  if (!row || !editedData) return

  try {
    // 关键逻辑：根据用户选择的中文类型名，反查对应的代码
    const selectedKindName = editedData.bookKind;
    const newKindCode = kindMap[selectedKindName] || 'LIT'; // 默认值防止出错

    const result = await axios.put(`http://localhost:3000/api/books/${row?.bookId}`,{
      书籍名: editedData.bookName,
      书籍状态: editedData.bookStatus,
      书籍作者: editedData.bookAuthor,
      书籍简介: editedData.bookDetails,
      书籍单价: editedData.bookPrice,
      书籍类型代码: newKindCode // 传入转换后的代码
    })
    
    // 更新本地数据
    Object.assign(row, editedData)
    row.bookKindCode = newKindCode; // 同时也更新本地的代码字段

    delete editableData[key]
    message.success('修改成功')
  } catch (error) {
    console.error(error)
    message.error('修改失败')
  }
};

const cancel = (key: string) => {
  delete editableData[key];
};

//图书详细
const openModal = (details: string) => {
  open.value = true
  currentDetails.value = details
}

//搜索完成
const onSearch = () => {
  const result = booksSource.value.filter((item) => {
    return item.bookName.includes(WhatSearch.value) || item.bookAuthor.includes(WhatSearch.value)
  })
  tempDS.value = JSON.parse(JSON.stringify(result))
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

.status-tag {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}
.status-free { background-color: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-rented { background-color: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }
.status-sold { background-color: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }

.action-link {
    color: #1890ff;
}
.action-link:hover {
    text-decoration: underline;
}

.edit-btn {
    color: #722ed1;
}

.editable-row-operations a {
  margin-right: 8px;
}
</style>