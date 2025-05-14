'use strict'

const li    = document.querySelectorAll('.li');
const content = document.querySelectorAll('.content-table');

// CLICK en li
    //TODOS .li le quitamos la clase active
    //TODOS .block le quitamos la clase active
    //AÑADIMOS la clase active al li que clickeamos
    //AÑADIMOS la clase active al block que clickeamos

//recorremos todos los li
li.forEach((cadaLi, i) => {
    //asignamos un evento click a cada li
    li[i].addEventListener('click', () => {
        //recorremos todos los li otra vez
        //para quitar la clase active a todos los li y block
        li.forEach((cadaLi, i) => {

            //removemos la clase active a todos los li y block
            li[i].classList.remove('active');
            content[i].classList.remove('active');
        })

        //añadimos la clase active al li y block que clickeamos
        li[i].classList.add('active');  
        content[i].classList.add('active');
    })
})