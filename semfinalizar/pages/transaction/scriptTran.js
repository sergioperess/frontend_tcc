const cadastro1 = document.querySelector("form");
const Ivalor = document.querySelector(".valor");
const Itipo = document.querySelector(".tipo");
const Idescricao = document.querySelector(".descricao");

function cadastrar(){
    fetch("http://localhost:8080/api/transaction",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                transaction: Ivalor.value,
                type: Itipo.value,
                description: Idescricao.value
            })            
        }
    )
    .then(function (res) {console.log(res) })
    .catch(function (res) {console.log(res) })
}

function limpar(){

    Ivalor.value = "";
    Itipo.value = "";
    Idescricao.value = "";
}

cadastro1.addEventListener('submit', function(event){
    event.preventDefault();

    cadastrar();

    limpar();
});
