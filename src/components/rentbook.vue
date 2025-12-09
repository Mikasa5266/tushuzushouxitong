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