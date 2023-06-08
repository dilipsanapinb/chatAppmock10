

const form = document.querySelector('form');

form.addEventListener('submit', addUser)

async function addUser(e) {
    e.preventDefault();
    let username = document.getElementById('username').value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let userObj = {
        username: username,
        email: email,
        password:password
    }
    let res = await fetch("https://mockchatapp.onrender.com/user/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify(userObj),
    });
    if (res.ok) {
        alert("User Register Successfully, Please Check Your Email for verify email")
    }
}