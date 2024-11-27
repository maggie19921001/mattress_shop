const apiPath = 'yuhueiorder';
const token = 'BneqNu9wpuURnm0zizTXC71Fddo1';

// C3.js
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: [
        ['Louvre 雙人床架', 1],
        ['Antony 雙人床架', 2],
        ['Anty 雙人床架', 3],
        ['其他', 4],
        ],
        colors:{
            "Louvre 雙人床架":"#DACBFF",
            "Antony 雙人床架":"#9D7FEA",
            "Anty 雙人床架": "#5434A7",
            "其他": "#301E5F",
        }
    },
});

let ordersData = [];

//單一筆訂單
function createOrderItem(item){
    const orderItem = document.createElement('tr');

    const td0 = document.createElement('td');
    td0.innerText = item.id;

    const td1 = document.createElement('td');
    const clientName = document.createElement('p');
    clientName.innerText = item.user.name;
    const classPhone = document.createElement('p');
    classPhone.innerText = item.user.tel;
    td1.append(clientName, classPhone);

    const td2Address = document.createElement('td');
    td2Address.innerText = item.user.address;

    const td3Email = document.createElement('td');
    td3Email.innerText = item.user.email;

    const td4 = document.createElement('td');
    const productName = document.createElement('p');
    let str = '';
    item.products.forEach(product=>{
        str+=`<li>${product.title} x ${product.quantity}組</li>`;
    });
    productName.innerHTML = str;
    td4.appendChild(productName);

    const td5Date = document.createElement('td');
    td5Date.innerText = item.createdAt;

    const td6 = document.createElement('td');
    td6.className = 'orderStatus';
    const orderStatus = document.createElement('a');
    if(item.paid){
        orderStatus.innerText = '已付款';
    }else{
        orderStatus.innerText = '未處理';
    }
    td6.appendChild(orderStatus);

    const td7 = document.createElement('td');
    td7.innerHTML = `<input type="button" class="delSingleOrder-Btn" value="刪除">`;

    orderItem.append(td0, td1, td2Address, td3Email, td4, td5Date, td6, td7);

    return orderItem;

}

//輸出訂單
const orderPageTable = document.querySelector('.orderPage-table');
function renderOrders(ordersData){
    ordersData.orders.forEach(item => {
        const orderItem = createOrderItem(item);
        orderPageTable.append(orderItem);
        orderPageTable.querySelector('.delSingleOrder-Btn').addEventListener('click', removeOrder);
    });
}

//取得訂單列表
async function getOrders(){
    try{
        const api = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/yuhueiorder/orders'
        const orderRes = await axios.get(api,{
            headers:{
                authorization:token
            }
        });
        ordersData = orderRes.data;
        renderOrders(ordersData);
        console.log(ordersData);
    }catch(error){
        console.error('Error during get orders:', error.response.data.message);
    }
}

function removeOrder(){
    console.log('test');
}


function init(){
    getOrders();
  }
  init();