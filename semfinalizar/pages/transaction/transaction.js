const Ivalor = document.getElementById("transaction");
const Itipo = document.getElementById("type");
const Idescricao = document.getElementById("description");


// chama o backend
function findTransactions() {
    setTimeout(() => {
        fetch("http://localhost:8080/api/transaction",
            {
                method: "GET"         
            }
        )
    }, 1000)
    

}

function createRow (client) {
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
        <td>${client.Ivalor}</td>
        <td>${client.Itipo}</td>
        <td>${client.Idescricao}</td>
    `
    document.querySelector('#tableTran>tbody').appendChild(newRow)
}


// Mostra a resposta do backedn na tela
function addTransactionsToScreen() {
    const dbClient = findTransactions();
    dbClient.forEach(createRow)
    console.log('ok')
    
}

function cadastrarTransacao(){
    window.location.href = "cadastroTran.html";
}

function formatDate(date) {
    return new LocalDateTime(date).toLocalDateString('pt-br');
}

function formatMoney(money) {
    return `${money.currency} ${money.value.toFixed(2)}`;
}