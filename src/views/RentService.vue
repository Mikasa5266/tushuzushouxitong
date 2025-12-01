<template>
    <List style="height: 100vh;" justify-content="center" align-items="center">
        <List class="wrapper" justify-content="center" align-items="center">
            <List justify-content="center" align-items="center">
                <h2>租用/购买图书</h2>
            </List>
            <List style="width: 80%;">
                <Form>
                    <List justify-content="center" align-items="center">
                        <List style="background-color: #f9fafb;padding-bottom: 20px;" justify-content="center"
                            align-items="center">
                            <List justify-content="center" align-items="center">
                                <h3>基本信息</h3>
                            </List>
                            <Divider></Divider>
                            <FormItem>
                                <AutoComplete v-model:value="WhatSearchBook" :options="optionsB" style="width: 500px;"
                                    @focus="optionsB = searchResultB()" @select="onSelectB" @search="onSearchB">
                                    <template #option="item">
                                        <div style="display: flex; justify-content: center; gap: 5px;">
                                            <span>{{ item.bookName }}</span>
                                            <span>{{ item.authName }}</span>
                                        </div>
                                    </template>
                                    <Input placeholder="请输入你要查询的图书名或作者名"></Input>
                                </AutoComplete>
                            </FormItem>
                            <List class="BookInfo" justify-content="center" align-items="center">
                                <div class="xsxiang">
                                    <span class="xianshi">图书编号</span><span class="xianshi">{{ targetBook?.bookId
                                    }}</span>
                                </div>
                                <div class="xsxiang">
                                    <span class="xianshi">图书名:</span><span class="xianshi">{{ targetBook?.bookName
                                    }}</span>
                                </div>
                                <div class="xsxiang">
                                    <span class="xianshi">作者名:</span><span class="xianshi">{{
                                        targetBook?.bookAuthor }}</span>
                                </div>
                                <div class="xsxiang">
                                    <span class="xianshi">图书类型</span><span class="xianshi">{{ targetBook?.bookKind
                                        }}</span>
                                </div>
                                <div class="xsxiang">
                                    <span class="xianshi">单价</span><span class="xianshi">{{ targetBook?.bookPrice
                                    }}</span>
                                </div>
                            </List>
                        </List>
                        <FormItem>
                            <Button @click="openModal" type="primary" size="large" style="width: 200px;">确认</Button>
                        </FormItem>
                    </List>
                </Form>
            </List>
        </List>
        <Modal title="用户信息" v-model:open="open" :footer="null" centered>
            <List align-items="center" justify-content="center">
                <AutoComplete v-model:value="WhatSaerchCustomer" :options="optionsC" @search="onSearchC"
                    @focus="onSearchC" @select="onSelectC">
                    <template #option="item">
                        <div style="display: flex; gap: 5px;">
                            <span class="xianshi">{{ item.customerName }}</span><span class="xianshi">{{
                                item.customerTelnum }}</span>
                        </div>
                    </template>
                    <Input style="width: 300px;"></Input>
                </AutoComplete>
                <List justify-content="center" align-items="center">
                    <div class="xsxiang"><span class="xianshi">姓名</span><span class="xianshi">{{
                        targetCustomer?.customerName
                    }}</span></div>
                    <div class="xsxiang"><span class="xianshi">手机号</span><span class="xianshi">{{
                        targetCustomer?.customerTelNum
                    }}</span></div>
                    <div class="xsxiang"><span class="xianshi">是否为会员</span><span class="xianshi">{{
                        targetCustomer?.IsMember
                    }}</span></div>
                </List>
                <List>
                    <Button style="width: 200px;" type="primary" :disabled="openButton"
                        @click="rentBookButton">借书</Button>
                    <Button type="primary" @click="buyBookButton">买书</Button>
                </List>
            </List>
        </Modal>
        <Modal :width="210" v-model:open="openfukuan" :footer="null" title="扫码付款" centered>
            <Space direction="vertical" align="center">
                <QRCode :value="fukuan"></QRCode>
            </Space>
        </Modal>
    </List>
</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import { AutoComplete, Button, Divider, Form, FormItem, Input, InputSearch, message, Modal, QRCode, Select, Space } from 'ant-design-vue';
import { couldStartTrivia, isElementAccessChain } from 'typescript';
import { reactive, ref } from 'vue';
//数据项
//选项的接口
interface OptionB {
    value: string,
    bookName: string,
    authName: string,
}
interface OptionC {
    value: string,
    customerName: string,
    customerTelnum: string
}
//书本的接口

enum BKind {
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

interface Book {
    key: string
    bookId: string,
    bookName: string,
    bookStatus: string,
    bookAuthor: string,
    bookDetails: string,
    bookKind: BKind,
    bookPrice: number
}
interface Customer {
    key: string,
    customerNum: string,
    customerName: string,
    customerTelNum: string,
    customerGender: string,
    IsMember: string,
}
//控制对话框展开
const open = ref(false)
const WhatSearchBook = ref('')
const WhatSaerchCustomer = ref('')
const optionsB = ref<OptionB[]>([])

const optionsC = ref<OptionC[]>([])

//书本数据
const books = ref<Book[]>([{
    key: '1',
    bookId: 'B001',
    bookName: '深入浅出Vue3',
    bookStatus: '在库',
    bookAuthor: '李明',
    bookDetails: '系统讲解Vue3核心功能与项目实战。',
    bookKind: BKind.IT,
    bookPrice: 58,
},
{
    key: '2',
    bookId: 'B002',
    bookName: '现代文学赏析',
    bookStatus: '在库',
    bookAuthor: '王晓晨',
    bookDetails: '国内外现代文学的深入分析。',
    bookKind: BKind.LIT,
    bookPrice: 46,
},
{
    key: '3',
    bookId: 'B003',
    bookName: '人工智能导论',
    bookStatus: '借出',
    bookAuthor: '周强',
    bookDetails: '全面介绍人工智能基本理论与应用。',
    bookKind: BKind.IT,
    bookPrice: 72,
},
{
    key: '4',
    bookId: 'B004',
    bookName: '经济学原理',
    bookStatus: '在库',
    bookAuthor: '张伟',
    bookDetails: '从零开始学习经济学基础知识。',
    bookKind: BKind.ECO,
    bookPrice: 68,
},
{
    key: '5',
    bookId: 'B005',
    bookName: '历史的轨迹',
    bookStatus: '损坏',
    bookAuthor: '陈子昂',
    bookDetails: '对历史进程的深度探讨。',
    bookKind: BKind.HIS,
    bookPrice: 55,
},
{
    key: '6',
    bookId: 'B006',
    bookName: '生物的奥秘',
    bookStatus: '在库',
    bookAuthor: '赵宏',
    bookDetails: '适合学生阅读的自然科学科普知识。',
    bookKind: BKind.SCI,
    bookPrice: 39,
},
{
    key: '7',
    bookId: 'B007',
    bookName: '人性的弱点',
    bookStatus: '在库',
    bookAuthor: '戴尔·卡耐基',
    bookDetails: '经典人文社科畅销之作。',
    bookKind: BKind.HUM,
    bookPrice: 49,
},
{
    key: '8',
    bookId: 'B008',
    bookName: '股票投资基础',
    bookStatus: '借出',
    bookAuthor: '刘深',
    bookDetails: '介绍股票投资的基本技巧和方法。',
    bookKind: BKind.FIN,
    bookPrice: 65,
},
{
    key: '9',
    bookId: 'B009',
    bookName: '哲学简史',
    bookStatus: '在库',
    bookAuthor: '罗素',
    bookDetails: '哲学思想演进的简明入门。',
    bookKind: BKind.PHI,
    bookPrice: 52,
},
{
    key: '10',
    bookId: 'B010',
    bookName: '艺术鉴赏入门',
    bookStatus: '在库',
    bookAuthor: '李红',
    bookDetails: '帮助读者建立艺术欣赏基础。',
    bookKind: BKind.ART,
    bookPrice: 48,
},
{
    key: '11',
    bookId: 'B011',
    bookName: '商业管理实务',
    bookStatus: '借出',
    bookAuthor: '王磊',
    bookDetails: '企业管理的真实案例分析。',
    bookKind: BKind.MAN,
    bookPrice: 59,
},
{
    key: '12',
    bookId: 'B012',
    bookName: '市场营销基础教程',
    bookStatus: '在库',
    bookAuthor: '赵倩',
    bookDetails: '从零讲解市场营销核心概念。',
    bookKind: BKind.MAR,
    bookPrice: 54,
},
{
    key: '13',
    bookId: 'B013',
    bookName: '医学常识大全',
    bookStatus: '在库',
    bookAuthor: '杨医生',
    bookDetails: '科普常见疾病与健康知识。',
    bookKind: BKind.MED,
    bookPrice: 66,
},
{
    key: '14',
    bookId: 'B014',
    bookName: '工程力学基础',
    bookStatus: '在库',
    bookAuthor: '朱建国',
    bookDetails: '讲解工程力学的基础理论。',
    bookKind: BKind.ENG,
    bookPrice: 78,
},
{
    key: '15',
    bookId: 'B015',
    bookName: '教育心理学',
    bookStatus: '借出',
    bookAuthor: '李教授',
    bookDetails: '教育心理领域的权威著作。',
    bookKind: BKind.EDU,
    bookPrice: 42,
},
{
    key: '16',
    bookId: 'B016',
    bookName: '小熊的快乐一天',
    bookStatus: '在库',
    bookAuthor: '童心',
    bookDetails: '儿童绘本，适合 3-6 岁阅读。',
    bookKind: BKind.CHI,
    bookPrice: 28,
},
{
    key: '17',
    bookId: 'B017',
    bookName: '青少年成长指南',
    bookStatus: '在库',
    bookAuthor: '刘燕',
    bookDetails: '为青少年提供人生规划建议。',
    bookKind: BKind.YOU,
    bookPrice: 35,
},
{
    key: '18',
    bookId: 'B018',
    bookName: '家居生活美学',
    bookStatus: '借出',
    bookAuthor: '王静',
    bookDetails: '介绍生活美学与家居设计。',
    bookKind: BKind.LIF,
    bookPrice: 44,
},
{
    key: '19',
    bookId: 'B019',
    bookName: '世界旅游地图册',
    bookStatus: '在库',
    bookAuthor: '环球出版社',
    bookDetails: '丰富的全球旅游地图与介绍。',
    bookKind: BKind.TRA,
    bookPrice: 80,
},
{
    key: '20',
    bookId: 'B020',
    bookName: '人物传记精选',
    bookStatus: '在库',
    bookAuthor: '孙凯',
    bookDetails: '收录多位知名人物人生故事。',
    bookKind: BKind.BIO,
    bookPrice: 50,
}
    ,])
const targetBook = ref<Book>()

//顾客数据
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
const targetCustomer = ref<Customer>()

const openButton = ref(true)
//方法实现
//查询图书的方法
const onSelectB = (value: any) => {
    WhatSearchBook.value = value
    const result = books.value.filter((item) => {
        return item.bookName.includes(WhatSearchBook.value) || item.bookAuthor.includes(WhatSearchBook.value)
    })
    targetBook.value = result[0]
    IsSelectB.value = true
}
const searchResultB = (): OptionB[] => {
    const result = books.value.filter((item) => {
        return item.bookName.includes(WhatSearchBook.value) || item.bookAuthor.includes(WhatSearchBook.value)
    })
    //刷新目前显示图书

    const tempoptions = reactive<OptionB[]>([])
    result.forEach(element => {
        tempoptions.push({
            value: element.bookName,
            bookName: element.bookName,
            authName: element.bookAuthor
        })
    });
    return tempoptions
}
const onSearchB = (value: any) => {
    optionsB.value = searchResultB()
}
const IsSelectB = ref(false)
//查询顾客的方法
const onSelectC = (value: any) => {
    WhatSaerchCustomer.value = value
    const result = customers.value.filter((item) => {
        return item.customerTelNum.includes(WhatSaerchCustomer.value) || item.customerName.includes(WhatSaerchCustomer.value)
    })
    targetCustomer.value = result[0]
    openButton.value = result[0]?.IsMember === '否'
    IsSelectC.value = true
}
const onSearchC = () => {
    const result = customers.value.filter((item) => {
        return item.customerTelNum.includes(WhatSaerchCustomer.value) || item.customerName.includes(WhatSaerchCustomer.value)
    })
    const temp = ref<OptionC[]>([])
    result.forEach(element => {
        temp.value.push({
            value: element.customerName,
            customerName: element.customerName,
            customerTelnum: element.customerTelNum
        })
    });
    optionsC.value = temp.value
}
const IsSelectC = ref(false)
//对话框配置
const openModal = () => {
    open.value = true
}
//出租按钮
const rentBookButton = () => {
    if (!IsSelectB.value) {
        message.error("请先选择图书")
    } else if (!IsSelectC.value) {
        message.error("请先选择客户信息")
    }
    message.success("恭喜您借书成功")
}
const buyBookButton = () => {
    if (!IsSelectB.value) {
        message.error("请先选择图书")
    } else if (!IsSelectC.value) {
        message.error("请先选择客户信息")
    }
    openfukuan.value = true
}

//付款二维码
const openfukuan = ref(false)
const fukuan = ref("https://www.yuanshen.com/#/")
</script>

<style scoped>
.wrapper {
    width: 800px;
    max-height: 1000px;
    background-color: white;
    border-radius: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 0 20px;
}

.xsxiang {
    display: flex;
    gap: 5px;
    justify-content: left;
}

.xianshi {
    display: block;
    width: 150px;
    align-content: center;
}
</style>