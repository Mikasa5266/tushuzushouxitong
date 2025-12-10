<template>
    <Modal :open="open" @update:open="$emit('update:open', $event)" title="确认订单" :footer="null" centered>
        <List align-items="center" justify-content="center">
            <List align-items="center">
                <div class="xsxiang">
                    <span class="xianshi">书籍名称：</span>
                    <span class="xianshi">{{ bookName }}</span>
                </div>
                <div class="xsxiang">
                    <span class="xianshi">租借人:</span>
                    <span class="xianshi">{{ customerName }}</span>
                </div>
                <div class="xsxiang">
                    <span class="xianshi">租借天数：</span>
                    <span class="xianshi">
                        <Select 
                            :value="duration" 
                            @update:value="$emit('update:duration', $event)"
                            style="width: 120px;" 
                        >
                            <SelectOption :value="1">1天</SelectOption>
                            <SelectOption :value="3">3天</SelectOption>
                            <SelectOption :value="5">5天</SelectOption>
                            <SelectOption :value="7">7天</SelectOption>
                            <SelectOption :value="15">15天</SelectOption>
                            <SelectOption :value="30">30天</SelectOption>
                        </Select>
                    </span>
                </div>
                <div class="xsxiang">
                    <span class="xianshi">押金：</span>
                    <span class="xianshi">{{ deposit }}</span>
                </div>
            </List>
            <List justify-content="center" align-items="center">
                <Button style="width: 400px;" type="primary" @click="$emit('confirm')">确定</Button>
            </List>
        </List>
    </Modal>
</template>

<script setup lang="ts">
import { Button, Modal, Select, SelectOption } from 'ant-design-vue';
import List from '@/components/List.vue';

defineProps<{
    open: boolean,
    bookName?: string,
    customerName?: string,
    duration: number,
    deposit: number
}>();

defineEmits<{
    (e: 'update:open', val: boolean): void,
    (e: 'update:duration', val: number): void,
    (e: 'confirm'): void
}>();
</script>

<style scoped>
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