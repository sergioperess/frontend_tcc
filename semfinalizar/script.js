const cadastro = document.querySelector("form");
const IfirstName = document.querySelector(".firstName");
const IlastName = document.querySelector(".lastName");
const Icpf = document.querySelector(".cpf");
const Isenha = document.querySelector(".senha");
const Iemail = document.querySelector(".email");


function cadastrar(){
    fetch("http://localhost:8080/users",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                firstName: IfirstName.value,
                lastName: IlastName.value,
                cpf: Icpf.value,
                senha: Isenha.value,
                email: Iemail.value
            })            
        }
    )
    .then(function (res) {console.log(res) })
    .catch(function (res) {console.log(res) })
}

function limpar(){

    IfirstName.value = "";
    IlastName.value = "";
    Icpf.value = "";
    Isenha.value = "";
    Iemail.value = "";
}

function newTransaction(){
    window.location.href = "pages/transaction/transaction.html";
}

function register(){
    window.location.href = "pages/cadastro.html";
}

cadastro.addEventListener('submit', function(event){
    // Previne que a pagina seja atualizada
    event.preventDefault();

    cadastrar();

    limpar();
});