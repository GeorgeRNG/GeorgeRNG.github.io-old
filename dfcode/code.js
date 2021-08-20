//the following line hopefully saves my sanity by making it clear where everything is lol.

let hardvalues = {"event":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"control":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"else": {},"entity_action":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"entity_event":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"game_action":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"if_entity":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"if_game":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"if_player":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"if_var":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"player_action":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"repeat":{"Line 1":"action","Line 2":"target","Line 3":"inverted"},"set_var":{"Line 1":"action","Line 2":"target","Line 3":"inverted"}};



code = ""
function err(text,type=""){
document.getElementById("errorbox").style.display = "initial";
document.getElementById("error").innerHTML = text
if(type != ""){
document.getElementById("errortype").innerHTML = type + " Error:"
}else{
document.getElementById("errortype").innerHTML = "Error:"
}
}
function importcode(){
try{
var textin = document.getElementById("encodedinput").value
var found = textin.match(/"code":"[a-z,A-Z,0-9,/,=,+]+/);
if (found != null){
textin = found[0].replace('"code":"','');
}
var decoded = String.fromCharCode.apply(null, new Uint16Array(pako.inflate(atob(textin).split('').map(function(x){return x.charCodeAt(0);}))));
code = decoded
rendblocks()
}catch(er){
err(er,"Import")
}
}
function exportcode(){
try{
document.getElementById("encodedoutput").value = (btoa(String.fromCharCode.apply(null, new Uint16Array(pako.gzip(code)))));
}catch(er){err(er)}
}
function rendblocks(){
if(document.getElementById("pretty").checked){
try{
document.getElementById("rawdecoded").value = JSON.stringify(JSON.parse(code),null,2);
}catch{
err("JSON", "A parsing error happened, probably bad JSON.")
}
}else{
document.getElementById("rawdecoded").value = code
}
document.getElementById("code-list").innerHTML = ""
JSON.parse(code)["blocks"].forEach((block, index) => {
img = document.createElement("img");
if(block["id"] == "block"){
img.src = "images/normal/" + block["block"] + ".png"}
if(block["id"] == "bracket"){
img.src = "images/brackets/" + block["direct"]
if(block["type"] == "repeat"){img.src = img.src + "s.png"}else{img.src = img.src + ".png"}
}
img.classList = ["block"]
img.onclick = function(index){selectblock(index)};
img.classList.add("block")
img.id = "block-" + String(index);
img.draggable = false
img.ondragstart = () => {return false}
document.getElementById("code-list").appendChild(img);
})
}

function hardtag(key,label,block){
var parsed = JSON.parse(code);
var obj = document.createElement("label");
obj.innerHTML = label + " ";
obj.for = key;
document.getElementById("blockinfo").appendChild(obj);
var obj = document.createElement("input");
obj.id = key;
obj.type = "text";
var x = parsed["blocks"][block][key]
if(x!=undefined){obj.value=x;}else{obj.value="";}
obj.onchange = (event) => {
changeelement(selected,event.target.id,event.target.value)
}
document.getElementById("blockinfo").appendChild(obj);
document.getElementById("blockinfo").appendChild(document.createElement("br"));
}

function changeelement(block,tagname,objective){
var parsed = JSON.parse(code);
parsed["blocks"][block][tagname] = objective;
code = JSON.stringify(parsed);
rendblocks();
}

function selectblock(clickedobj){
selected = Number(clickedobj.target.id.replace("block-",""))
document.getElementById("blockinfo").innerHTML = "<span>Block " + selected + "</span></br>"
var parsed = JSON.parse(code)
var block = parsed["blocks"][selected]
try{
for ([key, value] of Object.entries(hardvalues[block["block"]])){
hardtag(value,key,selected)
}
}
catch{
if(block["id"] == "block"){
for(var key in block){
hardtag(key,key,selected)
}
}
}
if(block["id"] == "bracket"){
var final = document.createElement("div")
var input = document.createElement("select")
input.innerHTML = '<option value="open">Opening Bracket</option><option value="close">Closing Bracket</option>'
input.value = parsed["blocks"][selected]["direct"]
input.id = "direct"
input.onchange = () => {
var x = parsed
x["blocks"][selected]["direct"] = document.getElementById("direct").value
code = JSON.stringify(x);
rendblocks()
}
final.appendChild(input)
final.appendChild(document.createElement("br"))
var input = document.createElement("input")
input.type = "checkbox"
if(parsed["blocks"][selected]["type"] == "repeat"){
input.checked = true
}
input.id = "sticky"
input.onclick = () => {
var x = parsed
x["blocks"][selected]["type"] = document.getElementById("sticky").checked ?"repeat" : "norm"
code = JSON.stringify(x);
rendblocks()}
final.appendChild(input)
var input = document.createElement("label")
input.innerHTML = "Sticky"
input.for = "sticky"
final.appendChild(input)
document.getElementById("blockinfo").appendChild(final)
}
}
function copy() {
var copyText = document.getElementById("encodedoutput");
document.getElementById("encodedoutput").disabled = 0
copyText.select();
copyText.setSelectionRange(0, 999999);
document.execCommand("copy");
document.getElementById("encodedoutput").disabled = "disabled"
alert("It should now be on your clipboard!\n")
} 