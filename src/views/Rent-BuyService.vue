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
                            <Button @click="openModal" type="primary" size="large" style="width: 200px;"
                                :disabled="openBookButton">确认</Button>
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
                    <Button style="width: 200px;" type="primary" :disabled="openRentButton"
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
        <Modal v-model:open="openRentdingdan" title="确认订单" :footer="null" centered>
            <List align-items="center" justify-content="center">
                <List align-items="center">
                    <div class="xsxiang"><span class="xianshi">书籍名称：</span><span class="xianshi">{{ targetBook?.bookName
                            }}</span>
                    </div>
                    <div class="xsxiang"><span class="xianshi">租借人:</span><span class="xianshi">{{
                            targetCustomer?.customerName
                            }}</span></div>
                    <div class="xsxiang">
                        <span class="xianshi">租借天数：</span>
                        <span class="xianshi">
                            <Select v-model:value="timeLength" style="width: 120px;" @change="handleTimeChange"
                            :rules="[{ required: true, message: '请选择租借时长' }]"
                            >
                                <Option value="1">1天</Option>
                                <Option value="3">3天</Option>
                                <Option value="5">5天</Option>
                                <Option value="7">7天</Option>
                                <Option value="15">15天</Option>
                                <Option value="30">30天</Option>
                            </Select>
                        </span>
                    </div>
                    <div class="xsxiang"><span class="xianshi">押金：</span><span class="xianshi">{{ yajin }}</span></div>
                </List>
                <List justify-content="center" align-items="center">
                    <Button style="width: 400px;" type="primary" @click="submitDingdan">确定</Button>
                </List>
            </List>
        </Modal>
        <Modal v-model:open="openBuyOrder" title="确认购买订单" :footer="null" centered>
        <List align-items="center" justify-content="center">
            <List align-items="center">
                <div class="xsxiang">
                    <span class="xianshi">书籍名称：</span>
                    
                    <span class="xianshi">{{ targetBook?.bookName }}</span>
                </div>
                <div class="xsxiang">
                    <span class="xianshi">购买人:</span>
                    
                    <span class="xianshi">{{ targetCustomer?.customerName }}</span>
                </div>
                <div class="xsxiang">
                    <span class="xianshi">应付金额：</span>
                    <span class="xianshi" style="color: red; font-size: 1.2em;">￥{{ targetBook?.bookPrice }}</span>
                </div>
            </List>
            <List justify-content="center" align-items="center">
                <Button style="width: 400px;" type="primary" @click="submitSaleOrder">确认支付并购买</Button>
            </List>
        </List>
    </Modal>
    </List>
</template>

<script setup lang="ts">
import List from '@/components/List.vue';
import { AutoComplete, Button, Divider, Flex, Form, FormItem, Input, InputSearch, message, Modal, QRCode, Select, Space } from 'ant-design-vue';
import { Option } from 'ant-design-vue/es/vc-select';
import axios from 'axios';
import { couldStartTrivia, isElementAccessChain } from 'typescript';
import { computed, onMounted, reactive, ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';

//路由
const router = useRouter()
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

const books = ref<Book[]>([])
const targetBook = ref<Book>()
const openBookButton = ref(true)
//顾客数据

const customers = ref<Customer[]>([])
const targetCustomer = ref<Customer>()

//获取图书和顾客信息
onMounted(async () => {
    //获取图书、
    const result1 = await axios.get('http://localhost:3000/api/books')
    const thebooks: Book[] = result1.data.map((item: any) => ({
        key: item['书籍号'],
        bookId: item['书籍号'],
        bookName: item['书籍名'],
        bookStatus: item['书籍状态'],
        bookAuthor: item['书籍作者'],
        bookDetails: item['书籍简介'],
        bookKind: item['书籍类型'],
        bookKindCode: item['书籍类型代码'],
        bookPrice: item['书籍单价']
    }))
    books.value = thebooks
    //获取顾客
    const result2 = await axios.get('http://localhost:3000/api/customers')
    const thecustomers: Customer[] = result2.data.map((item: any) => ({
        key: item['顾客号'],
        customerNum: item['顾客号'],
        customerName: item['姓名'],
        customerTelNum: item['电话号码'],
        customerGender: item['性别'],
        IsMember: item['会员状态']
    }))
    customers.value = thecustomers
})
const openRentButton = ref(true)
//方法实现
//查询图书的方法
const onSelectB = (value: any) => {
    WhatSearchBook.value = value
    const result = books.value.filter((item) => {
        return (item.bookName.includes(WhatSearchBook.value) || item.bookAuthor.includes(WhatSearchBook.value) && item.bookStatus != '已租' && item.bookStatus != '已售')
    })
    targetBook.value = result[0]
    IsSelectB.value = true
    openBookButton.value = false
}
const searchResultB = (): OptionB[] => {
    const result = books.value.filter((item) => {
        return (
            (item.bookName.includes(WhatSearchBook.value) ||
                item.bookAuthor.includes(WhatSearchBook.value))
            &&
            item.bookStatus !== '已租' &&
            item.bookStatus !== '已售'
        );
    });

    return result.map((element) => ({
        value: element.bookName,
        bookName: element.bookName,
        authName: element.bookAuthor
    }));
};

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
    openRentButton.value = result[0]?.IsMember === '非会员'
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
//确定出租订单
const openRentdingdan = ref(false)
const timeLength = ref(1)  
const yajin = computed(() => {
    if (!targetBook.value) return 0
    return Math.round(targetBook.value.bookPrice * 1.2)
});
const handleTimeChange = () => {

}
const submitDingdan = async () => {
    const now = Date()
    const result = await axios.post('http://localhost:3000/api/rent', {
        customerId: targetCustomer.value?.customerNum,
        bookId: targetBook.value?.bookId,
        rentDate: now,
        rentDays: timeLength.value,
        deposit: yajin.value
    })
    console.log(result)
    message.success('租书成功')
    router.push('/')
}
//确定购买订单、
const openBuyOrder = ref(false)
const submitSaleOrder = async ()=>{
    const now = Date()
    const result = await axios.post('http://localhost:3000/api/buy',{
        customerId:targetCustomer.value?.customerNum,
        bookId:targetBook.value?.bookId,
        saleDate:now,
        salePrice:targetBook.value?.bookPrice,
        paymentStatus:'已支付'
    })
    message.success('买书成功')
    router.push('/')

}
//出租按钮

const rentBookButton = () => {
    if (!IsSelectB.value) {
        message.error("请先选择图书")
    } else if (!IsSelectC.value) {
        message.error("请先选择客户信息")
    }
    openRentdingdan.value = true
}
//购买按钮
const buyBookButton = () => {
    if (!IsSelectB.value) {
        message.error("请先选择图书")
    } else if (!IsSelectC.value) {
        message.error("请先选择客户信息")
    }
    openBuyOrder.value = true
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