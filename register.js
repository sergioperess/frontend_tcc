document.getElementById("createForm").addEventListener("submit", function(e) {
    const apiUrl = "http://localhost:8080/auth/register";

    e.preventDefault();
    const firstName = document.querySelector(".firstName");
    const lastName = document.querySelector(".lastName");
    const cpf = document.querySelector(".cpf");
    const senha = document.querySelector(".senha");
    const email = document.querySelector(".email");

    const data = { 
        firstName: firstName.value, 
        lastName: lastName.value,
        cpf: cpf.value,
        senha: senha.value,
        email: email.value
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Item criado:", data);
        localStorage.setItem('userId', data.id);
        setTimeout(window.location.href = './transaction.html', 2500);
    })
    .catch(error => console.error("Erro ao criar item:", error));
});
