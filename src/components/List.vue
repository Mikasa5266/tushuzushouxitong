<template>
    <div class="list" :class="{ dots, dimmed, grow }"
        :style="{ gap: dots ? 0 : gap, alignItems, justifyContent, flexDirection: inline ? 'row' : 'column' }">
        <slot />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    gap: {
        type: String,
        default: '16px'
    },
    alignItems: {
        type: String,
    },
    justifyContent: {
        type: String
    },
    inline: {
        type: Boolean,
        default: false
    },
    dots: {
        type: Boolean,
        default: false,
    },
    dimmed: {
        type: Boolean,
        default: false,
    },
    grow : {
        type: Boolean,
        default: false,
    }
})
</script>

<style lang="scss">
.list {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p {
        margin: 0;
    }
}
</style>

<style lang="scss" scoped>
.list {
    display: flex;

    &.grow {
        >* {
            flex-grow: 1;
        }
    }

    &.dots {
        >*::after {
            content: '⋅';
            display: inline-block;
            margin: 0 4px;
            color: #aaa;
        }

        >*:last-child:after {
            content: none;
        }
    }

    &.dimmed {
        color: #aaa;
    }
}
</style>