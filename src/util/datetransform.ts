export const datetransform = (date: string):string => {
    const thedate = new Date(date)
    const localDateTime = thedate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // 使用 24 小时制
    })
    return localDateTime
}