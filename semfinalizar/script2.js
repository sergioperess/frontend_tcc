
function deleteData(index) {
    fetch(`http://localhost:8080/users/${index}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.statusText);
        }
    })
    .then(data => {
        console.log("Delete bem-sucedido:", data);
    })
    .catch(error => {
        console.error("Erro:", error);
    });
}


function readClient() {
    fetch(`http://localhost:8080/users`)
    .then(function(response){
        return response.json();
    })
    .then(function(response){
        response?.forEach(users => {

            createRow(users);

            /*item.innerHTML = `
            <td>${users.id}</td>
            <td>${users.firstName}</td>
            <td>${users.lastName}</td>
            <td>${users.password}</td>
            <td>${users.email}</td>
            `
            document.querySelector('#tableClient>tbody').appendChild(item)*/
        })
    })    
    
}

const createRow = (client, index) => {
    const newRow = document.createElement('tr')
    newRow.innerHTML = `
        <td>${client.id}</td>
        <td>${client.firstName}</td>
        <td>${client.lastName}</td>
        <td>${client.senha}</td>
        <td>${client.email}</td>
        <td>
            <button type="button" class="button green" id="edit-${index}">Editar</button>
            <button type="button" class="button red" id="delete-${index}" >Excluir</button>
        </td>
    `
    document.querySelector('#tableClient>tbody').appendChild(newRow)
}

const clearTable = () => {
    const rows = document.querySelectorAll('#tableClient>tbody tr')
    rows.forEach(row => row.parentNode.removeChild(row))
}

const updateTable = () => {
    const dbClient = readClient()
    clearTable()
    dbClient?.forEach(createRow);
}

updateTable()


// "id":1,"firstName":"Sérgio","lastName":"Peres","password":null,"email":"sergio1@gmail.com
// https://www.youtube.com/watch?v=il0Dog9Y4xs -- https://www.youtube.com/watch?v=30sYreFItTY -- https://www.youtube.com/watch?v=W-wBG3sVQL0 
// https://www.youtube.com/watch?v=tRcnPcSbGrI
// https://www.youtube.com/watch?v=il0Dog9Y4xs

/*

fetch(`http://localhost:8080/users`)
    .then(response => response.json())
    .then(dados => {
        const div = document.getElementById("thead");
        div.innerHTML = JSON.stringify(dados);
        console.log(div);
    })
    .catch(err => console.error(err));    


    fetch(`http://localhost:8080/users`)
    .then(function(response){
        return response.json();
    })
    .then(function(response){
        response.data.array.forEach(users => {
            let item = document.createElement("conteudo");

            item.innerHTML = JSON.stringify(users);

            list.appendChild(item);
        })
    })    
*/