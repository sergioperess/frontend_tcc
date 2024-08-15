const cadastro1 = document.querySelector("form");
const Ivalor = document.querySelector(".valor");
const Itipo = document.querySelector(".tipo");
const Idescricao = document.querySelector(".descricao");


    fetch("http://localhost:8080/api/transaction",
        {
            method: "GET"         
        }
    )
    .then(function (res) {console.log(res) })
    .catch(function (res) {console.log(res) })



