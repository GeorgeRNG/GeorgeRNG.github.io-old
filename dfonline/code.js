function init(nw){
    if(nw){
        if(window.sessionStorage["template"] == undefined){window.location.href = "index.html"; return;} // must have an imported template :>
        code = JSON.parse(decompress(window.sessionStorage["template"]));
        window.oncontextmenu = () => {return false}
        {//this gets and parses actiondump for needed data.
            fetch('https://georgerng.github.io/dfonline/db.json') // Gets ?actiondump.
                .then(response => response.json())
                .then(data => {
                    db = data;
                    document.getElementById("html").style.cursor = "progress"
                    var obj
                    db["codeblocks"].forEach(block => {
                        obj = document.createElement("img")
                        obj.src = "images/rends/" + block["item"]["material"] + ".png"
                        obj.classList = "blockdrag codedrag noselect"
                        obj.id = block["identifier"]
                        obj.onclick = () => {return false;}
                        obj.draggable = true
                        obj.addEventListener("dragstart", event => {drag = event.target.id;})
                        document.getElementById("footer").appendChild(obj)
                    })
                })
                .then(() => {// ready:
                    hv()
                    rendblocks()
                    document.getElementById("html").style.cursor = "auto"
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

function hv(){
    var legacy = document.getElementById("legacy").checked
    console.log("Hardvalues! Legacy is",legacy)
    hardvalues = {"idname":Object.fromEntries(db["codeblocks"].map(x => {return [x["identifier"],x["name"]]})),"actions":{}}
    hardvalues["tagnames"] = ["action","target","subAction","inverted","data"]
    hardvalues["nameid"] = Object.fromEntries(Object.entries(hardvalues["idname"]).map(x => {return x.reverse()}))
    db["codeblocks"].map(x => {return x["identifier"]}).forEach(x => {
        hardvalues["actions"][x] = [""]
    })
    db["actions"].forEach(x => {
        if(x.icon.description.length != 0 || legacy){
            hardvalues["actions"][hardvalues["nameid"][x["codeblockName"]]].push(x["name"])
        }
    })
}

//some stuff I won't need to care about any further lol.

function rotatecheck(){
    if(window.matchMedia("(orientation: portrait)").matches){
        alert("It is recommended to use landscape mode.")
    }
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
        else{//normal blocks
            src = block["block"]
            if(block["block"] != "else"){
                sign = document.createElement("div")
                sign.className = "sign noselect"
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
        obj.draggable = true
        obj.id = "block" + String(i)
        obj.classList = "blockdrag block " + src;
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
        obj.addEventListener("dragstart", event => {drag = Number(event.target.id.replace("block",""))})
        obj.addEventListener("dragenter", event => {event.preventDefault();reeds(event).classList.add("codehover");})
        obj.addEventListener("dragexit", event => {reeds(event).classList.remove("codehover")})
        obj.addEventListener("drop",event => {event.preventDefault(); reeds(event).classList.remove("codehover"); if(typeof(drag) == "number"){var x = code["blocks"][Number(reeds(event).id.replace("block",""))];code["blocks"][Number(reeds(event).id.replace("block",""))] = code["blocks"][drag];code["blocks"][drag] = x;rendblocks()}else{
            var x = reeds(event)
            code["blocks"].splice(Number(x.id.replace("block","")) + Number(event.clientX - x.getBoundingClientRect().x >= x.getBoundingClientRect().width/2 ? 1 : 0),0,{"id":"block","block":drag,"action":""})
            rendblocks()
        };})
        obj.addEventListener("dragover", event => {event.preventDefault();})
        document.getElementById("codespace").appendChild(obj)
    })
}

function reeds(event){
    return(event.target.parentElement.id == "" ? event = event.target.parentElement.parentElement : event = event.target)
}

function ctx(block, id){
    if(block){
        document.getElementById("menu").innerHTML = ""
        var obj = document.createElement("h2")
        obj.innerHTML = "Block " + id.toString()
        var menu = document.createElement("div")
        document.getElementById("menu").appendChild(obj)
        {
            var div = document.createElement("div")
            if(code["blocks"][id]["id"] != "bracket")
            {
                obj = document.createElement("label")
                obj.innerHTML = "Action "
                var x = code["blocks"][id]["action"] == undefined ? "data" : "action"
                obj.setAttribute("for",x+String(id))
                div.appendChild(obj)
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
                obj.onchange = event => {edit(event)};
                div.appendChild(obj);
                if(["player_action","if_player","if_entity","entity_action"].includes(code["blocks"][id]["block"])){//selection
                    div.appendChild(document.createElement("br"))
                    obj = document.createElement("label");
                    obj.setAttribute("for","target"+String(id));
                    obj.innerHTML = "Selection "
                    div.appendChild(obj)
                    obj = document.createElement("select");
                    obj.id = "target"+String(id);
                    obj.onchange = event => {edit(event)};
                    ["","Selection","Default","Killer","Damager","Shooter","Victim","AllPlayers"].forEach(x => {
                            var select = document.createElement("option")
                            select.value = x;
                            select.innerHTML = x;
                            obj.appendChild(select)
                        }
                    )
                    obj.value = code["blocks"][id]["target"]
                    div.appendChild(obj)
                }
                obj = ["if_var","if_player","if_entity","if_game"].includes(code["blocks"][id]["block"]);
                if(obj){//NOT and above is not decider.
                div.appendChild(document.createElement("br"))
                obj = document.createElement("label")
                obj.setAttribute("for","inverted"+String(id));
                obj.innerHTML = "NOT";
                div.appendChild(obj);
                obj = document.createElement("input");
                obj.type = "checkbox";
                obj.id = "inverted"+String(id);
                obj.onchange = event => {edit(event)};
                obj.checked = code["blocks"][id]["inverted"] == "NOT"
                div.appendChild(obj);
            }
            div.appendChild(document.createElement("br"));
            }
            else{
                menu.style.display = "block"
                {// direct
                    obj = document.createElement("label")
                    obj.setAttribute("for","direct"+String(id))
                    obj.innerHTML = "Direction"
                    menu.appendChild(obj)
                    obj = document.createElement("select")
                    obj.id = "direct"+String(id)
                    obj.onchange = event => {edit(event)}
                    var select = document.createElement("option")
                    select.innerHTML = "Opening"
                    select.value = "open"
                    obj.appendChild(select)
                    select = document.createElement("option")
                    select.innerHTML = "Closing"
                    select.value = "close"
                    obj.appendChild(select)
                    obj.value = code["blocks"][id]["direct"]
                    menu.appendChild(obj)
                }
                menu.appendChild(document.createElement("br"))
                {// sticky
                    obj = document.createElement("label")
                    obj.setAttribute("for","type"+String(id))
                    obj.innerHTML = "Sticky"
                    menu.appendChild(obj)
                    obj = document.createElement("input")
                    obj.id = "type"+String(id)
                    obj.type = "checkbox"
                    obj.checked = code["blocks"][id]["type"] == "repeat"
                    obj.onclick = event => {edit(event)}
                    menu.appendChild(obj)
                }
                menu.appendChild(document.createElement("br"))
            }
            div.appendChild(document.createElement("br"));
            obj = document.createElement("button");
            obj.innerHTML = "Delete";
            obj.id = "delete"+String(id);
            obj.onclick = event => {
                delete code["blocks"][Number(event.target.id.replace("delete",""))];
                rendblocks()
                document.getElementById("overlay").click()
            }
            div.appendChild(obj)
            menu.appendChild(div)}
        document.getElementById("menu").appendChild(menu)
    }
    {//overlay stuff.
        document.getElementById("overlay").style.display = "block";
        document.getElementById("overlay").onanimationend = event => {if(event.target.id == "overlay"){event.target.style.display = "none"; event.target.classList = ""}}
        document.getElementById("overlay").oncontextmenu = event => {event.target.click()}
        document.getElementById("overlay").onclick = event => {if(event.target.id == "overlay"){event.target.classList = "fadeout"; document.getElementById("menu").animationPlayState = "unset"}}
        document.getElementById("menu").style.animationPlayState = "running"
    }
}

function edit(event){
    var id = Number(event.target.id.match(/[0-9]+/g)[0]);
    var tag = event.target.id.replace(String(id),"");
    if(tag == "inverted")
    {
        code["blocks"][id][tag] = event.target.checked ? "NOT" : ""
    }
    else if(tag == "type"){
        code["blocks"][id][tag] = event.target.checked ? "repeat" : "norm"
    }
    else
    {code["blocks"][id][tag] = event.target.value;}
    rendblocks()
}

{//decode en/de:code stuff
function decompress(x){return String.fromCharCode.apply(null,new Uint16Array(pako.inflate(new Uint8Array(atob(x).split('').map((e)=>{return e.charCodeAt(0);})))));}
function compress(x){return (btoa(String.fromCharCode.apply(null, new Uint16Array(pako.gzip(x)))));}
}

function incode(nw){
    if(nw){
        document.getElementById("templatedata").value = "H4sIAAAAAAAAA6tWSsrJT84uVrKKjq0FAPAORtkNAAAA"
    }
    else
    {
        var x = document.getElementById("templatedata").value.match(/"code":"[a-z,A-Z,0-9,/,=,+]+/g)
        if(x != null){
            document.getElementById("templatedata").value = x[0].replace('"code":"','')
        }
    }
    ws.close()
    window.sessionStorage["template"] = document.getElementById("templatedata").value
    window.location.href = "edit.html";
}

function codeout(){
    ctx(false,0);
    document.getElementById("menu").innerHTML = "";
    var obj = document.createElement("h2");
    obj.innerHTML = "Export";
    document.getElementById("menu").appendChild(obj);
    obj = document.createElement("p");
    obj.innerHTML = "There are various ways to get code into diamondfire. The following are the options of getting the template into diamondfire, or copying the template data.";
    document.getElementById("menu").appendChild(obj);
    obj = document.createElement("button");
    obj.innerHTML = "Copy Data";
    obj.onclick = () => {
        navigator.clipboard.writeText(compress(JSON.stringify(code)))
        document.getElementById("overlay").click()
    }
    document.getElementById("menu").appendChild(obj)
    document.getElementById("menu").appendChild(document.createElement("br"))
    obj = document.createElement("button");
    obj.innerHTML = "Copy Give Command";
    obj.onclick = () => {
        navigator.clipboard.writeText(`/give @p minecraft:ender_chest{PublicBukkitValues:{"hypercube:codetemplatedata":'{"author":"DFOnline","name":"§bDFOnline §3» §bTemplate","version":1,"code":"` + compress(JSON.stringify(code)) + `"}'},display:{Name:'{"extra":[{"bold":false,"italic":false,"underlined":false,"strikethrough":false,"obfuscated":false,"color":"aqua","text":"DFOnline "},{"italic":false,"color":"dark_aqua","text":"» "},{"italic":false,"color":"aqua","text":"Template"}],"text":""}'}} 1`)
        document.getElementById("overlay").click()
    }
    document.getElementById("menu").appendChild(obj)
}