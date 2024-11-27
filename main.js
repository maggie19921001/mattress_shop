const apiPath = 'yuhueiorder';
const token = 'BneqNu9wpuURnm0zizTXC71Fddo1';

let allProducts = [];
const productWrap = document.querySelector('.productWrap');
//單個產品
function createProductCard(product){
  const productCard = document.createElement('li');
  productCard.className = 'productCard';
  
  const productType = document.createElement('h4');
  productType.className = 'productType';
  productType.innerText = '新品';

  const productImg = document.createElement('img');
  productImg.src = product.images;

  const addCardBtn = document.createElement('a');
  addCardBtn.className = 'addCardBtn';
  addCardBtn.innerText = '加入購物車';
  addCardBtn.dataset.id = product.id;

  const productName = document.createElement('h3');
  productName.innerText = product.title;

  const originPrice = document.createElement('del');
  originPrice.className = 'originPrice';
  originPrice.innerText = `NT$${product.origin_price}`;

  const nowPrice = document.createElement('p');
  nowPrice.className = 'nowPrice';
  nowPrice.innerText = `NT$${product.price}`;

  productCard.append(productType, productImg, addCardBtn, productName, originPrice, nowPrice);

  return productCard;
}
//取得產品列表
async function getProducts(){
  try{
    const api = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`
    const res = await axios.get(api);
    allProducts = res.data.products;

    allProducts.forEach(product => {
      const createProduct = createProductCard(product);
      productWrap.appendChild(createProduct);
      // 在 addCardBtn 上加上事件監聽器
      createProduct.querySelector('.addCardBtn').addEventListener('click', addToCart);
    });
    // console.log(allProducts)
  }catch(error){
    console.error('Error during get products:', error.response.data.message);
  }
}

//監聽下拉選單
const productDisplay = document.querySelector('.productDisplay');
productDisplay.addEventListener('change',function filterProducts(el){
  if( el.target.value === '全部'){
    productWrap.innerHTML = ''; 
    allProducts.forEach(product => {
      const createProduct = createProductCard(product);
      productWrap.appendChild(createProduct);
      createProduct.querySelector('.addCardBtn').addEventListener('click', addToCart);
    });
  }else{
    productWrap.innerHTML = ''; 
    const filteredProducts = allProducts.filter(product => {
      return product.category.includes(el.target.value);
    });
    filteredProducts.forEach(product => {
      const createProduct = createProductCard(product);
      productWrap.appendChild(createProduct);
      createProduct.querySelector('.addCardBtn').addEventListener('click', addToCart);
    });
  } 
})

let cartProducts = [];

//單個購物車產品
function createCartList(item){
  const cartItemList = document.createElement('tr');
  cartItemList.className = 'cartItem-list';

  const listItem = document.createElement('td');

  const cardItemTitle = document.createElement('div');
  cardItemTitle.className = 'cardItem-title';

  const cardItemImg = document.createElement('img');
  cardItemImg.src = item.product.images;
  const cardItemName = document.createElement('p');
  cardItemName.innerText = item.product.title;

  cardItemTitle.append(cardItemImg, cardItemName);
  listItem.appendChild(cardItemTitle);

  const originPrice = document.createElement('td');
  originPrice.innerText = `NT$${item.product.origin_price}`;

  const qty = document.createElement('td');
  qty.innerText = item.quantity;

  const price = document.createElement('td');
  price.innerText = `NT$${item.product.price}`;

  const discardBtn = document.createElement('td');
  discardBtn.className = 'discardBtn'
  discardBtn.innerHTML = `<a class='material-icons'>clear</a>`;
  discardBtn.dataset.id = item.id;

  cartItemList.append(listItem, originPrice, qty, price, discardBtn)

  return cartItemList;
}

const shoppingCartTable = document.querySelector('.shoppingCart-table');
const allRows = shoppingCartTable.getElementsByTagName('tr');
const secondToLastIndex = allRows.length - 2;
const referenceRow = allRows[secondToLastIndex];

//初次獲取購物車內容
async function getCart(){
  try{
    const api = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`
    const res = await axios.get(api);
    cartProducts = res.data;
    renderCart(cartProducts);
  }catch(error){
    console.error('Error during get carts:', error.response.data.message);
  }
}

//輸出購物車內容（無ajax)
function renderCart(cartProducts){
  shoppingCartTable.innerHTML = `<tr>
                                  <th width="40%">品項</th>
                                  <th width="15%">單價</th>
                                  <th width="15%">數量</th>
                                  <th width="15%">金額</th>
                                  <th width="15%"></th>
                                </tr>`;

  cartProducts.carts.forEach(item =>{
    const cartItem = createCartList(item);
    shoppingCartTable.append(cartItem);
    cartItem.querySelector('.discardBtn').addEventListener('click', removeCartProduct);
  });
  //加入表格最後一列
  const lastTableRow = document.createElement('tr');
  const td1 = document.createElement('td');
  const deleteAllBtn = document.createElement('a');
  deleteAllBtn.className = 'discardAllBtn'
  deleteAllBtn.innerText = '刪除所有品項';
  deleteAllBtn.addEventListener('click', clearCart);
  td1.appendChild(deleteAllBtn);

  const td2 = document.createElement('td');
  const td3 = document.createElement('td');

  const td4 = document.createElement('td');
  const totalPriceTitle = document.createElement('p');
  totalPriceTitle.innerText = '總金額';
  td4.appendChild(totalPriceTitle);

  const td5 = document.createElement('td');
  td5.className = 'total-price';
  td5.innerText = `NT$${cartProducts.finalTotal}`;

  lastTableRow.append(td1, td2, td3, td4, td5);
  shoppingCartTable.appendChild(lastTableRow);

console.log(cartProducts);
}

//加入購物車
async function addToCart(event){
  const addCardBtn = event.currentTarget;
  const productId = addCardBtn.dataset.id;

  if (!productId) {
    console.error('無法取得商品 ID');
    return;
  }

  try{
    let productAdded = {
      "data":{
        "productId": productId,
        "quantity": 1
      }}

    const api = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`
        
        // 檢查購物車中是否已有該商品
        let existCartItem = cartProducts.carts.find(item => item.product.id === productId);
        if (existCartItem) {
          // 增加數量
          productAdded.data.quantity = existCartItem.quantity + 1;
          productAdded.data.id = existCartItem.id;//直接新增patch要的id屬性
          const addRes = await axios.patch(api,productAdded);
          cartProducts = addRes.data;
          renderCart(cartProducts);
          // console.log('addRes',addRes.data);
        }else{
          const newRes = await axios.post(api, productAdded);
          cartProducts = newRes.data;
          renderCart(cartProducts);
          // console.log('newRes',newRes.data.carts);
        }
  }catch(error){
    console.error('Error during addToCart:', error.response.data.message);

  }
}

//清空購物車
async function clearCart(){
  try{
    const api = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`;
    const clearRes = await axios.delete(api);
    cartProducts = clearRes.data;
    // console.log(clearRes);
    alert(cartProducts.message);
    renderCart(cartProducts);
  }catch(error){
    console.error('Error during clear cart:', error.response.data.message);
  }
}

//刪除購物車特定商品
async function removeCartProduct(event){
  const discardBtnBtn = event.currentTarget;
  const carttId = discardBtnBtn.dataset.id;
  try{
    const api = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${carttId}`;
    const removeRes = await axios.delete(api);
    // console.log(removeRes);
    cartProducts = removeRes.data;
    renderCart(cartProducts);
  }catch(error){
    console.error('Error during remove cart product:', error.response.data.message);
  }
}

//訂單資料
const customerName = document.querySelector('#customerName');
const customerPhone = document.querySelector('#customerPhone');
const customerEmail = document.querySelector('#customerEmail');
const customerAddress = document.querySelector('#customerAddress');
const tradeWay = document.querySelector('#tradeWay');
//訂單資料
function createOrder(){
  return  {
    data: {
      user: {
        name: customerName.value,
        tel: customerPhone.value,
        email: customerEmail.value,
        address: customerAddress.value,
        payment: tradeWay.value
      }
    }
  }
}

//基本驗證
function checkForm() {
  const formGroups = document.querySelectorAll('.orderInfo-formGroup');
  let isValid = true;

  for (const group of formGroups) {
    const input = group.querySelector("input");
    if (input && input.value.trim() === "") {
      alert(`${input.name}不得為空`);
      isValid = false;
    }
  }
  return isValid;
}

//建立訂單
async function submitOrder(){
  const orderData = createOrder();
  console.log(orderData);
  if(checkForm()){
    try{
      const api = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`;
      const orderRes = await axios.post(api,orderData);
      alert('已送出訂單');
      const orderInfoForm = document.querySelector('.orderInfo-form');
      orderInfoForm.reset();
    }catch(error){
      console.error('Error during create order:', error.response.data.message);
    }
  }
}

const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',submitOrder);


function init(){
  getProducts();
  getCart();
}
init();