function init(nw){
    if(nw){
        if(window.sessionStorage["template"] == undefined){window.location.href = "index.html"; return;} // must have an imported template :>
        code = JSON.parse(decompress(window.sessionStorage["template"]));
        window.oncontextmenu = () => {return false}
        {//this gets and parses actiondump for needed data.
            fetch('https://georgerng.github.io/dfonline/db.json') // Gets ?actiondump.
                .then(response => response.json())
                .then(data => {db = data})
                .then(() => {// ready:
                    hardvalues = {"idname":Object.fromEntries(db["codeblocks"].map(x => {return [x["identifier"],x["name"]]})),"actions":{}}
                    hardvalues["tagnames"] = ["action","target","subAction","inverted","data"]
                    rendblocks()
                    hardvalues["nameid"] = Object.fromEntries(Object.entries(hardvalues["idname"]).map(x => {return x.reverse()}))
                    db["codeblocks"].map(x => {return x["identifier"]}).forEach(x => {
                        hardvalues["actions"][x] = []
                    })
                    db["actions"].forEach(x => {
                        hardvalues["actions"][hardvalues["nameid"][x["codeblockName"]]].push(x["name"])
                    })
                });
        }
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
    var src;
    var obj;
    var sign;
    var count
    code["blocks"].forEach((block,i) => {
        sign = false;
        if(block.id == "bracket"){//brackets.
            src = block["direct"]
            if(block["type"] != "norm"){
                src = src + "s"
            }
        }
        else
        {//normal blocks
            src = block["block"]
            if(block["block"] != "else"){
                sign = document.createElement("div")
                sign.className = "sign"
                obj = document.createElement("span")
                obj.innerHTML = hardvalues["idname"][block["block"]]
                sign.appendChild(obj)
                count = 3
                hardvalues["tagnames"].forEach(x => {
                    if(!(["",undefined].includes(block[x]))){
                        count = count - 1
                        obj = document.createElement("span")
                        obj.innerHTML = block[x]
                        sign.appendChild(obj)
                    }
                });
                [...Array(count)].forEach(() => {
                    obj = document.createElement("span")
                    obj.innerHTML = ""
                    sign.appendChild(obj)
                });
            }
        }
        obj = document.createElement("div");
        obj.id = "block" + String(i)
        obj.classList = "block " + src;
        if(sign != false){
            obj.appendChild(sign)
        }
        obj.oncontextmenu = event => {
            if (event.target.className == ""){
                ctx(true,event.target.parentElement.parentElement.id.replace("block",""))
                //click on sign?
            }
            else
            {
                ctx(true,event.target.id.replace("block",""))
                //click on block?
            }
        }
        document.getElementById("codespace").appendChild(obj)
    })
}

function ctx(block, id){
    if(block){
        document.getElementById("menu").innerHTML = ""
        var obj = document.createElement("h2")
        obj.innerHTML = "Block " + id.toString()
        document.getElementById("menu").appendChild(obj)
        obj = document.createElement("label")
        obj.innerHTML = "Line 1 "
        var x = code["blocks"][id]["action"] == undefined ? "data" : "action"
        obj.setAttribute("for",x+String(id))
        document.getElementById("menu").appendChild(obj)
        if(x == "data"){
            obj = document.createElement("input");
        }else{
            obj = document.createElement("select");
            hardvalues["actions"][code["blocks"][id]["block"]].forEach(x => {
                var select = document.createElement("option")
                select.value = x;
                select.innerHTML = x;
                obj.appendChild(select)
            }
            )
        }
        obj.value = code["blocks"][id][x]
        obj.id = x+String(id);
        obj.onchange = event => {edit(event)}
        document.getElementById("menu").appendChild(obj)
        {//overlay stuff.
            document.getElementById("overlay").style.display = "block";
            document.getElementById("overlay").onclick = event => {if(event.target.id == "overlay"){event.target.style.display = "none"}}
            document.getElementById("overlay").oncontextmenu = event => {if(event.target.id == "overlay"){event.target.style.display = "none"}}
        }
    }
}

function edit(event){
    var id = Number(event.target.id.match(/[0-9]+/g)[0]);
    var tag = event.target.id.replace(String(id),"");
    code["blocks"][id][tag] = event.target.value;
    rendblocks()
}


//decode encode stuff
function decompress(x){return String.fromCharCode.apply(null,new Uint16Array(pako.inflate(new Uint8Array(atob(x).split('').map((e)=>{return e.charCodeAt(0);})))));}