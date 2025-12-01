<template>
  <div class="table-scroll-wrapper">
   <List justify-content="center" align-items="center">
     <InputSearch
    placeholder="请输入您想查询的图书名或作者"
    enter-button
    v-model:value="WhatSearch"
    style="width: 800px;"
    size="large"
    @search="onSearch"
    ></InputSearch>
   </List>
    <Table :data-source="tempDS" :columns="columns" :scroll="{ x: 'max-content' }">
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
import List from '@/components/List.vue';
import { Input, InputSearch, Modal, Table } from 'ant-design-vue';
import { reactive, ref, type UnwrapRef } from 'vue';
//数据项定义
 enum BK {
  FIC = "小说",
  LIT = "文学",
  HUM = "人文社科",
  HIS = "历史",
  PHI = "哲学宗教",
  ART = "艺术",
  BIO = "传记",
  ECO = "经济",
  FIN = "金融投资",
  MAN = "管理",
  MAR = "市场营销",
  IT = "计算机",
  SCI = "自然科学",
  ENG = "工程技术",
  MED = "医学",
  EDU = "教育",
  CHI = "儿童绘本",
  YOU = "青少年读物",
  LIF = "生活家具",
  TRA = "旅游地图",
}

interface DataItems {
  key: string
  bookId: string,
  bookName: string,
  bookStatus: string,
  bookAuthor: string,
  bookDetails: string,
  bookKind: BK,
  bookPrice: number
}
const datasource = ref<DataItems[]>([{
    key: '1',
    bookId: 'B001',
    bookName: '深入浅出Vue3',
    bookStatus: '在库',
    bookAuthor: '李明',
    bookDetails: '系统讲解Vue3核心功能与项目实战。',
    bookKind: BK.IT,
    bookPrice: 58,
  },
  {
    key: '2',
    bookId: 'B002',
    bookName: '现代文学赏析',
    bookStatus: '在库',
    bookAuthor: '王晓晨',
    bookDetails: '国内外现代文学的深入分析。',
    bookKind: BK.LIT,
    bookPrice: 46,
  },
  {
    key: '3',
    bookId: 'B003',
    bookName: '人工智能导论',
    bookStatus: '借出',
    bookAuthor: '周强',
    bookDetails: '全面介绍人工智能基本理论与应用。',
    bookKind: BK.IT,
    bookPrice: 72,
  },
  {
    key: '4',
    bookId: 'B004',
    bookName: '经济学原理',
    bookStatus: '在库',
    bookAuthor: '张伟',
    bookDetails: '从零开始学习经济学基础知识。',
    bookKind: BK.ECO,
    bookPrice: 68,
  },
  {
    key: '5',
    bookId: 'B005',
    bookName: '历史的轨迹',
    bookStatus: '损坏',
    bookAuthor: '陈子昂',
    bookDetails: '对历史进程的深度探讨。',
    bookKind: BK.HIS,
    bookPrice: 55,
  },
  {
    key: '6',
    bookId: 'B006',
    bookName: '生物的奥秘',
    bookStatus: '在库',
    bookAuthor: '赵宏',
    bookDetails: '适合学生阅读的自然科学科普知识。',
    bookKind: BK.SCI,
    bookPrice: 39,
  },
  {
    key: '7',
    bookId: 'B007',
    bookName: '人性的弱点',
    bookStatus: '在库',
    bookAuthor: '戴尔·卡耐基',
    bookDetails: '经典人文社科畅销之作。',
    bookKind: BK.HUM,
    bookPrice: 49,
  },
  {
    key: '8',
    bookId: 'B008',
    bookName: '股票投资基础',
    bookStatus: '借出',
    bookAuthor: '刘深',
    bookDetails: '介绍股票投资的基本技巧和方法。',
    bookKind: BK.FIN,
    bookPrice: 65,
  },
  {
    key: '9',
    bookId: 'B009',
    bookName: '哲学简史',
    bookStatus: '在库',
    bookAuthor: '罗素',
    bookDetails: '哲学思想演进的简明入门。',
    bookKind: BK.PHI,
    bookPrice: 52,
  },
  {
    key: '10',
    bookId: 'B010',
    bookName: '艺术鉴赏入门',
    bookStatus: '在库',
    bookAuthor: '李红',
    bookDetails: '帮助读者建立艺术欣赏基础。',
    bookKind: BK.ART,
    bookPrice: 48,
  },
  {
    key: '11',
    bookId: 'B011',
    bookName: '商业管理实务',
    bookStatus: '借出',
    bookAuthor: '王磊',
    bookDetails: '企业管理的真实案例分析。',
    bookKind: BK.MAN,
    bookPrice: 59,
  },
  {
    key: '12',
    bookId: 'B012',
    bookName: '市场营销基础教程',
    bookStatus: '在库',
    bookAuthor: '赵倩',
    bookDetails: '从零讲解市场营销核心概念。',
    bookKind: BK.MAR,
    bookPrice: 54,
  },
  {
    key: '13',
    bookId: 'B013',
    bookName: '医学常识大全',
    bookStatus: '在库',
    bookAuthor: '杨医生',
    bookDetails: '科普常见疾病与健康知识。',
    bookKind: BK.MED,
    bookPrice: 66,
  },
  {
    key: '14',
    bookId: 'B014',
    bookName: '工程力学基础',
    bookStatus: '在库',
    bookAuthor: '朱建国',
    bookDetails: '讲解工程力学的基础理论。',
    bookKind: BK.ENG,
    bookPrice: 78,
  },
  {
    key: '15',
    bookId: 'B015',
    bookName: '教育心理学',
    bookStatus: '借出',
    bookAuthor: '李教授',
    bookDetails: '教育心理领域的权威著作。',
    bookKind: BK.EDU,
    bookPrice: 42,
  },
  {
    key: '16',
    bookId: 'B016',
    bookName: '小熊的快乐一天',
    bookStatus: '在库',
    bookAuthor: '童心',
    bookDetails: '儿童绘本，适合 3-6 岁阅读。',
    bookKind: BK.CHI,
    bookPrice: 28,
  },
  {
    key: '17',
    bookId: 'B017',
    bookName: '青少年成长指南',
    bookStatus: '在库',
    bookAuthor: '刘燕',
    bookDetails: '为青少年提供人生规划建议。',
    bookKind: BK.YOU,
    bookPrice: 35,
  },
  {
    key: '18',
    bookId: 'B018',
    bookName: '家居生活美学',
    bookStatus: '借出',
    bookAuthor: '王静',
    bookDetails: '介绍生活美学与家居设计。',
    bookKind: BK.LIF,
    bookPrice: 44,
  },
  {
    key: '19',
    bookId: 'B019',
    bookName: '世界旅游地图册',
    bookStatus: '在库',
    bookAuthor: '环球出版社',
    bookDetails: '丰富的全球旅游地图与介绍。',
    bookKind: BK.TRA,
    bookPrice: 80,
  },
  {
    key: '20',
    bookId: 'B020',
    bookName: '人物传记精选',
    bookStatus: '在库',
    bookAuthor: '孙凯',
    bookDetails: '收录多位知名人物人生故事。',
    bookKind: BK.BIO,
    bookPrice: 50,
  }
,])
const tempDS = ref<DataItems[]>([
  {
    key: '1',
    bookId: 'B001',
    bookName: '深入浅出Vue3',
    bookStatus: '在库',
    bookAuthor: '李明',
    bookDetails: '系统讲解Vue3核心功能与项目实战。',
    bookKind: BK.IT,
    bookPrice: 58,
  },
  {
    key: '2',
    bookId: 'B002',
    bookName: '现代文学赏析',
    bookStatus: '在库',
    bookAuthor: '王晓晨',
    bookDetails: '国内外现代文学的深入分析。',
    bookKind: BK.LIT,
    bookPrice: 46,
  },
  {
    key: '3',
    bookId: 'B003',
    bookName: '人工智能导论',
    bookStatus: '借出',
    bookAuthor: '周强',
    bookDetails: '全面介绍人工智能基本理论与应用。',
    bookKind: BK.IT,
    bookPrice: 72,
  },
  {
    key: '4',
    bookId: 'B004',
    bookName: '经济学原理',
    bookStatus: '在库',
    bookAuthor: '张伟',
    bookDetails: '从零开始学习经济学基础知识。',
    bookKind: BK.ECO,
    bookPrice: 68,
  },
  {
    key: '5',
    bookId: 'B005',
    bookName: '历史的轨迹',
    bookStatus: '损坏',
    bookAuthor: '陈子昂',
    bookDetails: '对历史进程的深度探讨。',
    bookKind: BK.HIS,
    bookPrice: 55,
  },
  {
    key: '6',
    bookId: 'B006',
    bookName: '生物的奥秘',
    bookStatus: '在库',
    bookAuthor: '赵宏',
    bookDetails: '适合学生阅读的自然科学科普知识。',
    bookKind: BK.SCI,
    bookPrice: 39,
  },
  {
    key: '7',
    bookId: 'B007',
    bookName: '人性的弱点',
    bookStatus: '在库',
    bookAuthor: '戴尔·卡耐基',
    bookDetails: '经典人文社科畅销之作。',
    bookKind: BK.HUM,
    bookPrice: 49,
  },
  {
    key: '8',
    bookId: 'B008',
    bookName: '股票投资基础',
    bookStatus: '借出',
    bookAuthor: '刘深',
    bookDetails: '介绍股票投资的基本技巧和方法。',
    bookKind: BK.FIN,
    bookPrice: 65,
  },
  {
    key: '9',
    bookId: 'B009',
    bookName: '哲学简史',
    bookStatus: '在库',
    bookAuthor: '罗素',
    bookDetails: '哲学思想演进的简明入门。',
    bookKind: BK.PHI,
    bookPrice: 52,
  },
  {
    key: '10',
    bookId: 'B010',
    bookName: '艺术鉴赏入门',
    bookStatus: '在库',
    bookAuthor: '李红',
    bookDetails: '帮助读者建立艺术欣赏基础。',
    bookKind: BK.ART,
    bookPrice: 48,
  },
  {
    key: '11',
    bookId: 'B011',
    bookName: '商业管理实务',
    bookStatus: '借出',
    bookAuthor: '王磊',
    bookDetails: '企业管理的真实案例分析。',
    bookKind: BK.MAN,
    bookPrice: 59,
  },
  {
    key: '12',
    bookId: 'B012',
    bookName: '市场营销基础教程',
    bookStatus: '在库',
    bookAuthor: '赵倩',
    bookDetails: '从零讲解市场营销核心概念。',
    bookKind: BK.MAR,
    bookPrice: 54,
  },
  {
    key: '13',
    bookId: 'B013',
    bookName: '医学常识大全',
    bookStatus: '在库',
    bookAuthor: '杨医生',
    bookDetails: '科普常见疾病与健康知识。',
    bookKind: BK.MED,
    bookPrice: 66,
  },
  {
    key: '14',
    bookId: 'B014',
    bookName: '工程力学基础',
    bookStatus: '在库',
    bookAuthor: '朱建国',
    bookDetails: '讲解工程力学的基础理论。',
    bookKind: BK.ENG,
    bookPrice: 78,
  },
  {
    key: '15',
    bookId: 'B015',
    bookName: '教育心理学',
    bookStatus: '借出',
    bookAuthor: '李教授',
    bookDetails: '教育心理领域的权威著作。',
    bookKind: BK.EDU,
    bookPrice: 42,
  },
  {
    key: '16',
    bookId: 'B016',
    bookName: '小熊的快乐一天',
    bookStatus: '在库',
    bookAuthor: '童心',
    bookDetails: '儿童绘本，适合 3-6 岁阅读。',
    bookKind: BK.CHI,
    bookPrice: 28,
  },
  {
    key: '17',
    bookId: 'B017',
    bookName: '青少年成长指南',
    bookStatus: '在库',
    bookAuthor: '刘燕',
    bookDetails: '为青少年提供人生规划建议。',
    bookKind: BK.YOU,
    bookPrice: 35,
  },
  {
    key: '18',
    bookId: 'B018',
    bookName: '家居生活美学',
    bookStatus: '借出',
    bookAuthor: '王静',
    bookDetails: '介绍生活美学与家居设计。',
    bookKind: BK.LIF,
    bookPrice: 44,
  },
  {
    key: '19',
    bookId: 'B019',
    bookName: '世界旅游地图册',
    bookStatus: '在库',
    bookAuthor: '环球出版社',
    bookDetails: '丰富的全球旅游地图与介绍。',
    bookKind: BK.TRA,
    bookPrice: 80,
  },
  {
    key: '20',
    bookId: 'B020',
    bookName: '人物传记精选',
    bookStatus: '在库',
    bookAuthor: '孙凯',
    bookDetails: '收录多位知名人物人生故事。',
    bookKind: BK.BIO,
    bookPrice: 50,
  }
,])
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
//搜索完成
const onSearch = ()=>{
     const result = datasource.value.filter((item)=>{
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