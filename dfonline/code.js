
function init(nw){
    if(nw){
        if(window.sessionStorage["template"] == undefined){window.location.href = "index.html"; return;} // must have an imported template :>
        code = JSON.parse(decompress(window.sessionStorage["template"]));
        window.oncontextmenu = () => {return false}
        rendblocks()
    }
    else{// this is for the initial page.
        ws = new WebSocket("ws://localhost:31371/codeutilities/item") // to be forgotten, gets codeutils item api.
        ws.onopen = () => {console.log("Can use item api now.")}
        ws.onmessage = x => {console.log("received item.");document.getElementById("templatedata").value=JSON.parse(JSON.parse(x["data"])["received"])["code"]}
    }
    rotatecheck()
    window.matchMedia("(orientation: portrait)").onchange = () => {}
}

//some stuff I won't need to care about any further lol.

function rotatecheck(){
    if(window.matchMedia("(orientation: portrait)").matches){
        alert("It is recommended to use landscape mode.")
    }
}

function incode(nw){
    if(nw){
        document.getElementById("templatedata").value = "H4sIAAAAAAAAA6tWSsrJT84uVrKKjq0FAPAORtkNAAAA"
    }
    window.sessionStorage["template"] = document.getElementById("templatedata").value
    window.location.href = "edit.html";
}


function rendblocks(){
    document.getElementById("codespace").innerHTML = null;
    var src
    var obj
    var sign
    code["blocks"].forEach(block => {
        if(block.id == "bracket"){
            src = block["direct"]
            if(block["type"] != "norm"){
                src = src + "s"
            }
        }
        else
        {
            src = block["block"]
        }
        obj = document.createElement("div");
        obj.classList = "block " + src;
        document.getElementById("codespace").appendChild(obj)
    })
}


//decode encode stuff
function decompress(x){return String.fromCharCode.apply(null,new Uint16Array(pako.inflate(new Uint8Array(atob(x).split('').map((e)=>{return e.charCodeAt(0);})))));}