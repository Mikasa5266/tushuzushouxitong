<template>
  <div class="table-scroll-wrapper">
    <Table :data-source="datasource" :columns="columns" :scroll="{ x: 'max-content' }">
      <template #bodyCell="{ column, text, record }">
        <template
          v-if="typeof column.dataIndex === 'string' && ['bookId', 'bookName', 'bookStatus', 'bookAuthor', 'bookKind', 'bookPrice'].includes(column.dataIndex)">
          <div>
            <Input v-model:value="editableData[record.key]![column.dataIndex as keyof DataItems]"
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
import { Input, Modal, Table } from 'ant-design-vue';
import { reactive, ref, type UnwrapRef } from 'vue';
//数据项定义
interface DataItems {
  key: string
  bookId: string,
  bookName: string,
  bookStatus: string,
  bookAuthor: string,
  bookDetails: string,
  bookKind: string,
  bookPrice: number
}
const datasource = ref<DataItems[]>([{
  key: '1',
  bookId: 'B001',
  bookName: '深入浅出Vue3',
  bookStatus: '在库',
  bookAuthor: '李明',
  bookDetails: '系统讲解Vue3核心功能与项目实战。',
  bookKind: '前端',
  bookPrice: 58,
},
{
  key: '2',
  bookId: 'B002',
  bookName: 'JavaScript高级程序设计',
  bookStatus: '借出',
  bookAuthor: 'Nicholas C. Zakas',
  bookDetails: 'JS领域的经典红宝书。',
  bookKind: '前端',
  bookPrice: 108,
},
{
  key: '3',
  bookId: 'B003',
  bookName: '算法导论',
  bookStatus: '在库',
  bookAuthor: 'Thomas H. Cormen',
  bookDetails: '算法学习入门与进阶的权威教材。',
  bookKind: '算法',
  bookPrice: 128,
},
{
  key: '4',
  bookId: 'B004',
  bookName: '深入理解计算机系统',
  bookStatus: '在库',
  bookAuthor: 'Randal E. Bryant',
  bookDetails: 'CSAPP 经典，讲解计算机底层原理。',
  bookKind: '计算机基础',
  bookPrice: 138,
},
{
  key: '5',
  bookId: 'B005',
  bookName: 'MySQL必知必会',
  bookStatus: '在库',
  bookAuthor: 'Ben Forta',
  bookDetails: '数据库基础入门读物。',
  bookKind: '数据库',
  bookPrice: 65,
},
{
  key: '6',
  bookId: 'B006',
  bookName: 'React实战进阶',
  bookStatus: '借出',
  bookAuthor: '王亮',
  bookDetails: '现代React生态项目实战。',
  bookKind: '前端',
  bookPrice: 76,
},
{
  key: '7',
  bookId: 'B007',
  bookName: '编译原理（龙书）',
  bookStatus: '在库',
  bookAuthor: 'Alfred V. Aho',
  bookDetails: '编译器相关的权威教材。',
  bookKind: '理论',
  bookPrice: 145,
},
{
  key: '8',
  bookId: 'B008',
  bookName: 'Linux命令行与Shell脚本',
  bookStatus: '在库',
  bookAuthor: 'Richard Blum',
  bookDetails: '覆盖Linux常用命令与脚本编程。',
  bookKind: '系统运维',
  bookPrice: 89,
},
{
  key: '9',
  bookId: 'B009',
  bookName: 'Python编程从入门到实践',
  bookStatus: '借出',
  bookAuthor: 'Eric Matthes',
  bookDetails: 'Python学习者的强烈推荐书籍。',
  bookKind: '后端',
  bookPrice: 88,
},
{
  key: '10',
  bookId: 'B010',
  bookName: '设计模式：可复用面向对象软件的基础',
  bookStatus: '在库',
  bookAuthor: 'Erich Gamma',
  bookDetails: 'GoF 设计模式经典著作。',
  bookKind: '软件工程',
  bookPrice: 118,
},])
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
//控制可编辑数据显示
const editableData = reactive<Record<string, DataItems | undefined>>({})
//控制对话框（图书详细）显示
const open = ref(false)
const currentDetails = ref('')
//方法实现

//编辑内容
const edit = (key: string) => {
  const row = datasource.value.find(item => key === item.key)
  editableData[key] = JSON.parse(JSON.stringify(row))
}
const save = (key: string) => {
  const row = datasource.value.find(item => key === item.key)
  if (row) Object.assign(row, editableData[key]);
  delete editableData[key];
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