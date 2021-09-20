//Objeto do modal
const Modal = {
  open(){
    document
      .querySelector('.modal-overlay')
      .classList.add('active');
  },
  close(){
    document
      .querySelector('.modal-overlay')
      .classList.remove('active');
  }
}

//criando o armazenamento para se guardar as informações
const Storage = {
  //pegando as informações
  get() {
    /*Para mostrar em tela não vou poder usar como string, assim tenho q 
    transformá-lo em array. Se não houver nada é p retornar um array vazio*/
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  //guardando as informações
  set(transactions) {
    /*aqui primeiro é definido o nome que quiser e depois o que será guardado. 
    Sempre fica guardado como string, e nesse caso estamos usando um array e 
    isso tem q se adaptado com o Json.stringify*/
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
  }
}

//formatando o valor da moeda:
const Utils = {
  /*formatType(type) {
    if (type === "e"){
      type = "+";
    }else{
      type = "-";
    }
     return type;
  },*/

  formatAmount(amount) {
    amount = amount * 100;
    return Math.round(amount);
  },

  formatDate(date) {
    const splittedDate = date.split("-"); 
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR",{
      style: "currency",
      currency: "BRL"
    });
    return signal + value;
  }
}

//Pegando as transações do objeto transactions e inserir no html
const DOM = {
  //selecionando o local onde serão inseridas as informações no html
  transactionsContainer: document.querySelector('#data-table tbody'),

  //adicionando as transações
  addTransaction(transaction, index){
    //console.log(transaction);
    //criando a row
    const tr = document.createElement('tr');
    //chamando o restante do html de baixo, as tds
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    //o index será a posição do array em q ele está
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index){
    //console.log('Cheguei 2');
    //criando variável com condicional para mudar classes:
    /*const CSSclass = Utils.formatType(type) == "" ? "income" : "expense";*/
    const CSSclass = transaction.amount >= 0 ? "income" : "expense";

    //formatando a moeda:
    const amount = Utils.formatCurrency(transaction.amount);
    

    //criando o modelo que tinha no html
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img src="./assets/minus.svg" id="minusImage" onclick="Transaction.remove(${index})" alt="Remover transação">
      </td>
    `
    return html;
  },

  //fazendo os cálculos de  Entradas, Saídas e Total grandes
  updateBalance(){
    document
    .getElementById('incomeDisplay')
    .innerHTML =Utils.formatCurrency(Transaction.incomes());
    document
    .getElementById('expenseDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
    .getElementById('totalDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.total());
  },

  //limpando as transações já inseridas na tela, para a nova atualização com novos dados
  clearTransactions(){
    DOM.transactionsContainer.innerHTML = "";
  }

}

const Transaction = {
  /*trazendo todas a transações(isso pq essas informações serão guardadas em 
  outro local, nesse caso na memória do navegador), para refatorar*/
  //transações que vão para o  html - array de objetos
  /*all: [{
    //id: 1,
    description: 'Luz',
    amount: -12589, //isso é -500,00
    date: '10/09/2021',
  },
  {
    //id: 2,
    description: 'Criação de Website',
    amount: 500000,
    date: '05/09/2021',
  },
  {
    //id: 3,
    description: 'Aluguel',
    amount: -88000, 
    date: '08/09/2021',
  },
  {
    //id: 4,
    description: 'App',
    amount: 20000, 
    date: '20/09/2021',
  }],*/
  //usando o local Storage:
  all: Storage.get(),

  //para adicionar novas transações:
  add(transaction){
    Transaction.all.push(transaction);
    App.reload();
  },

  //para remoção de transações - o ideal é se fazer isso através da remoção pelo Id
  remove(index){
    Transaction.all.splice(index, 1);
    App.reload();
  },

  incomes() {
    /*somar as entradas: 1 pegar todas a transações; 2 para cada transação maior
     que zero; somar a uma variável e retornar-la*/
    let income = 0;
    Transaction.all.forEach(transaction => {
      if (transaction.amount >= 0){
        income += transaction.amount;
      }
    })
    return income;
  },

  expenses() {
    /*somar as saídas: 1 pegar todas a transações; 2 para cada transação menor
     que zero; somar a uma variável e retornar-la*/
     let expense = 0;
     Transaction.all.forEach(transaction => {
       if (transaction.amount < 0){
        expense += transaction.amount;
       }
     })
     return expense;
  },

  total() {
    //lembrar que aqui seria x + -y
    return Transaction.incomes() + Transaction.expenses();
  }
}

/*var select = document.querySelector("select#type");
console.log(select);
for (var i = 0; i < select.length; i++) {
  console.log(select.options[i])
}
var optionText = select.options[select.selectedIndex].text;
console.log(optionText);
console.log(optionText[1]);
console.log(optionText[2]);*/

//recebendo as informações do formulário
const Form = {
  //pegando os dados do formulário:
  description: document.querySelector('input#description'),
 /* type: document.querySelector('select#type'),*/
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return{
      description: Form.description.value,
     /* type: Form.type.options[type.selectedIndex].text,*/
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  //verificar se todas as informações foram preenchidas
  validateFields(){
    const { description, type, amount, date } = Form.getValues();
    //verificando se estão vazias
    if ( description.trim() === "" || amount.trim() === "" || date.trim() === ""){
      throw new Error("Preencha todos os campos");
    }
  },

  //formatar os dados para salvar, nesse caso se usa o let p conseguir formatá-los
  formatValues(){
    let { description, type, amount, date } = Form.getValues();

    /*type = Utils.formatType(type);*/
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    
    return {
      description,
      /*type,*/
      amount,
      date
    }
  },

  //salvar
  saveTransaction(transaction){
    Transaction.add(transaction);
  },

  //apagar os dados no formulário, deixar em branco de novos
  clearFields(){
    Form.description.value = "",
    /*Form.type.selectedIndex = "",*/
    Form.amount.value = "",
    Form.date.value = ""
  },

  submit(event) {
    //é para evitar o comportamento padrão de enviar as inf pela URL, como no Get normal
    event.preventDefault();

    try {
      //verificar se todas as informações foram preenchidas
      Form.validateFields();
      
      //formatar os dados para salvar
      const transaction = Form.formatValues();

      //salvar
      Form.saveTransaction(transaction);

      //apagar os dados no formulário, deixar em branco de novos
      Form.clearFields();

      //fechar modal
      Modal.close();

    } catch (error) {
      alert(error.message);
    }
  }
}
console.log(Form)
/*para acessar esse storage, vou em application e Local Storage irá abrir 
o que existe lá*/

Storage.get()

//a aplicação sendo rodada e reiniciada:
const App = {
  init() {
    //trazendo as informações(transactions) para dentro da função de cima:
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });
    //atualizando nos cartões
    DOM.updateBalance();
    //atualizando no local storage
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init()
  },
}
//a aplicação irá iniciar de fato
App.init();


/*depois fazer a função para evitar de procurar números que não existem no array,
 contando ele (transaction.lenght) e criando uma condição.*/


//Dark-mode
const darkModeButton = document.querySelector('.dark-mode');
const darkModeBody = document.querySelector('body');
const changeLogo = document.querySelector('#logo');
//const minusImage = document.querySelector('#minusImage');
const incomeImage = document.querySelector('#incomeImage');
const expenseImage = document.querySelector('#expenseImage');

const Dark = {
  darkMode(){
    darkModeBody.classList.toggle('dark');
    if(darkModeBody.classList == 'dark'){
      darkModeButton.value = "Modo Claro";
      changeLogo.setAttribute('src', './assets/logoDarkMode.svg');
      //minusImage.setAttribute('src', './assets/minusDarkMode.svg');
      incomeImage.setAttribute('src','./assets/incomeDarkMode.svg');
      expenseImage.setAttribute('src','./assets/expenseDarkMode.svg');
    }else{
      darkModeButton.value = "Modo Escuro";
      changeLogo.setAttribute('src', './assets/logo.svg');
      //minusImage.setAttribute('src', './assets/minus.svg');
      incomeImage.setAttribute('src','./assets/income.svg');
      expenseImage.setAttribute('src','./assets/expense.svg');
    }
    
  }
}

