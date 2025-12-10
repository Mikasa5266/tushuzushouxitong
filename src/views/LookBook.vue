<template>
  <div class="table-scroll-wrapper">
    <List justify-content="center" align-items="center">
      <InputSearch placeholder="请输入您想查询的图书名或作者" enter-button v-model:value="WhatSearch" style="width: 800px;"
        size="large" @search="onSearch"></InputSearch>
    </List>
    <Table :data-source="tempDS" :columns="columns" :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, text, record }">
        <template
          v-if="typeof column.dataIndex === 'string' && ['bookId', 'bookName', 'bookStatus', 'bookAuthor', 'bookKind', 'bookPrice'].includes(column.dataIndex)">
          <div>
            <Input v-model:value="editableData[record.key]![column.dataIndex as keyof BookTable]"
              v-if="editableData[record.key]" />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'bookDetails'">
          <a @click="openModal(record.bookDetails)">详细</a>
        </template>
        <template v-else-if="column.dataIndex === 'edit'">
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
    <Modal title="图书详细" :footer="null" v-model:open="open" centered>
      {{ currentDetails }}
    </Modal>
  </div>

</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import type { BookTable } from '@/util/type';
import { Input, InputSearch, message, Modal, Table } from 'ant-design-vue';
import type { Data } from 'ant-design-vue/es/_util/type';
import { Item } from 'ant-design-vue/es/menu';
import axios from 'axios';
import { onMounted, reactive, ref, type UnwrapRef } from 'vue';

const booksSource = ref<BookTable[]>([])
const tempDS = ref<BookTable[]>([])
onMounted(async () => {
  const DS: BookTable[] = []
  const result = await axios.get('http://localhost:3000/api/books')
  for (let i = 0; i < result.data.length; i++) {
    const item = result.data[i]
    console.log(item)
    console.log(item['书籍类型代码'])
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
  { title: '书籍编号', dataIndex: 'bookId', key: 'bookId', width: 200 },
  { title: '图书名', dataIndex: 'bookName', key: 'bookName', width: 200 },
  { title: '书籍状态', dataIndex: 'bookStatus', key: 'bookStatus', width: 200 },
  { title: '书籍作者', dataIndex: 'bookAuthor', key: 'bookAuthor', width: 200 },
  { title: '书籍简介', dataIndex: 'bookDetails', key: 'bookDetails', width: 100 },
  { title: '书籍类型', dataIndex: 'bookKind', key: 'bookKind', width: 100 },
  { title: '书籍单价', dataIndex: 'bookPrice', key: 'bookPrice', width: 100 },
  {
    title: '编辑',
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

  if (!row) return
  try {
    const result = await axios.put(`http://localhost:3000/api/books/${row?.bookId}`,{
      书籍名:editedData?.bookName,
      书籍状态:editedData?.bookStatus,
      书籍作者:editedData?.bookAuthor,
      书籍简介:editedData?.bookDetails,
      书籍单价:editedData?.bookPrice,
      书籍类型代码:editedData?.bookKindCode
    })
    Object.assign(row, editableData[key])
    delete editableData[key]
    message.success('修改成功')
  } catch (error) {
    message.error('修改失败')
  }
  
};
const cancel = (key: string) => {
  delete editableData[key];
};
//图书详细
const openModal = (details: string) => {
  open.value = true
  console.log(open)
  currentDetails.value = details
  console.log(currentDetails)
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
.editable-row-operations a {
  margin-right: 8px;
}

.table-scroll-wrapper {
  overflow-x: auto;
  /* 横向滚动条只出现在这里 */
}
</style>