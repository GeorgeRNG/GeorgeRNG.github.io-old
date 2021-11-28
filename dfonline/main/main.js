'use strict';
let cuopen

function snackbar(message){
    var bar = document.createElement('span')
    bar.innerText = message
    bar.onclick = event => {if(!bar.classList.contains('snackbartime')){event.target.classList.add('snackbarout')}}
    bar.onanimationend = event => event.target.remove()
    document.getElementById('snackbars').appendChild(bar)
    setTimeout(() => {if(!bar.classList.contains('snackbarout')){bar.classList.add('snackbartime')}},4000)
}

function menu(title,content = document.createElement('span')){
    var bg = document.createElement('div')
    bg.classList = 'background'
    bg.onclick = event => {if(event.target.classList.contains('background')){event.target.remove()}}
    var screen = document.createElement('div')
    var obj = document.createElement('h1')
    obj.innerText = title
    screen.appendChild(obj)
    screen.appendChild(content)
    bg.appendChild(screen)
    document.getElementById('menus').appendChild(bg)
}

const codeutilities = new WebSocket('ws://localhost:31371/codeutilities/item')
codeutilities.onopen = () => {snackbar('Connected to codeutilties'); cuopen = true;}
codeutilities.onerror = () => {snackbar('Failed to connect to codeutilties'); cuopen = false;}