//图书表格元素
export interface BookTable {

  key: string
  bookId: string,
  bookName: string,
  bookStatus: string,
  bookAuthor: string,
  bookDetails: string,
  bookKind: string,
  bookKindCode:string,
  bookPrice: number,
  bookCount: number // 新增：库存数量
}
//用户表格元素
export interface CustomerTable {
    key: string,
    customerNum: string,
    customerName: string,
    customerTelNum: string,
    customerGender: string,
    IsMember: string,
}
//租售订单表格元素
export interface rentOrderTable{
    key:string,
    orderId:string,
    customerId:string,
    customerName:string,
    bookId:string,
    rentDate:string,
    deposit:number
}
// 买书订单表格元素
export interface saleOrderTable{
    key:string,
    orderId:string,
    customerId:string,
    customerName:string,
    bookId:string,
    saleDate:string,
    salePrice:number
}