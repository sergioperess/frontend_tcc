
// chama o backend
function findTransactions() {
    setTimeout(() => {
        let request = new XMLHttpRequest();
        request.open("GET", "http://localhost:8080/api/transaction", false);
        request.send();
        const result = request.responseText;
        console.log(result);
        addTransactionsToScreen(result);    
    }, 1000)
    

}

// Mostra a resposta do backedn na tela
function addTransactionsToScreen(transactions) {
    const orderedList = document.getElementById('transactions');

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.classList.add(transaction.type);

        const id = document.createElement('p');
        id.innerHTML = transaction.id;
        li.appendChild(id);

        const date = document.createElement('p');
        date.innerHTML = formatDate(transaction.date);
        li.appendChild(date);

        const money = document.createElement('p');
        money.innerHTML = formatMoney(transaction.money);
        li.appendChild(money);

        const type = document.createElement('p');
        type.innerHTML = transaction.type;
        li.appendChild(type);

        const description = document.createElement('p');
        description.innerHTML = transaction.description;
        li.appendChild(description);

        orderedList.appendChild(li);


    });
    
}

function formatDate(date) {
    return new LocalDateTime(date).toLocalDateString('pt-br');
}

function formatMoney(money) {
    return `${money.currency} ${money.value.toFixed(2)}`;
}