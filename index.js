const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

app.use(express.urlencoded({ extended: true }));

let users = []; 
let messages = {};

// 1. REGISTER PAGE
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="en"><head><script src="https://cdn.tailwindcss.com"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Love Finder 💖</title></head>
  <body class="bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center min-h-screen">
  <div class="bg-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-md">
  <h2 class="text-4xl font-bold text-center text-pink-600 mb-2">Love Finder</h2>
  <p class="text-center text-gray-500 mb-6">Find Your Soulmate 💎</p>
  <form action="/register" method="POST">
  <input name="name" placeholder="Enter Your Name" required class="w-full p-3 mb-4 border-2 rounded-lg focus:border-pink-500 outline-none">
  <select name="gender" required class="w-full p-3 mb-6 border-2 rounded-lg focus:border-pink-500 outline-none">
  <option value="">Select Your Gender</option><option value="male">👨 Male</option><option value="female">👩 Female</option></select>
  <button type="submit" class="w-full bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-lg font-bold text-lg">Start Finding 🚀</button>
  </form></div></body></html>`);
});

// 2. SHOW OPPOSITE GENDER
app.post('/register', (req, res) => {
  const { name, gender } = req.body;
  if (!users.find(u => u.name === name)) { users.push({ name, gender, id: Date.now() }); }
  const opposite = gender === 'male' ? 'female' : 'male';
  const peopleToShow = users.filter(u => u.gender === opposite);
  let cards = '';
  peopleToShow.forEach(person => {
    cards += `<a href="/chat?me=${name}&to=${person.name}" class="block transform hover:scale-105 transition"><div class="bg-white p-4 rounded-2xl shadow-lg text-center">
    <div class="w-24 h-24 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl font-bold">${person.name.charAt(0).toUpperCase()}</div>
    <h3 class="font-bold text-xl text-gray-800">${person.name}</h3><p class="text-pink-500 mt-1">Tap to Chat 💬</p></div></a>`;
  });
  res.send(`<!DOCTYPE html><html lang="en"><head><script src="https://cdn.tailwindcss.com"></script><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Find Matches</title></head>
  <body class="bg-gray-100"><div class="p-4 max-w-4xl mx-auto"><h2 class="text-3xl font-bold text-center mb-2 text-gray-800">Welcome ${name}! 👋</h2>
  <p class="text-center text-gray-600 mb-6">Here are ${opposite === 'male' ? 'Men' : 'Women'} online</p>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">${cards || '<p class="text-center col-span-2 text-gray-500">No one here yet. Share the link! 😅</p>'}</div></div></body></html>`);
});

// 3. CHAT PAGE
app.get('/chat', (req, res) => {
    const { me, to } = req.query; const room = [me, to].sort().join('-');
    res.send(`<!DOCTYPE html><html lang="en"><head><script src="https://cdn.tailwindcss.com"></script><script src="/socket.io/socket.io.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Chat with ${to}</title></head><body class="bg-gray-100 flex flex-col h-screen">
    <div class="bg-pink-600 text-white p-4 text-center font-bold text-xl shadow-md">Chatting with ${to}</div>
    <div id="messages" class="flex-1 p-4 overflow-y-auto"></div>
    <form id="form" class="p-4 bg-white flex shadow-inner"><input id="input" placeholder="Type a message..." class="flex-1 p-3 border rounded-l-lg outline-none"/>
    <button class="bg-pink-600 hover:bg-pink-700 text-white px-6 rounded-r-lg font-bold">Send</button></form>
    <script>const socket=io();const form=document.getElementById('form');const input=document.getElementById('input');
    const messages=document.getElementById('messages');const me='${me}';const to='${to}';const room='${room}';
    socket.emit('join room',room);form.addEventListener('submit',(e)=>{e.preventDefault();if(input.value){socket.emit('chat message',{room,from:me,to,text:input.value});input.value='';}});
    socket.on('chat message',(msg)=>{const item=document.createElement('div');item.classList.add('mb-3',msg.from===me?'text-right':'text-left');
    item.innerHTML='<span class="inline-block p-3 rounded-2xl max-w-xs '+(msg.from===me?'bg-pink-500 text-white':'bg-white shadow')+'">'+msg.text+'</span>';
    messages.appendChild(item);messages.scrollTop=messages.scrollHeight;});</script></body></html>`);
});

io.on('connection', (socket) => {
  socket.on('join room', (room) => socket.join(room));
  socket.on('chat message', (msg) => {
    if(!messages[msg.room]) messages[msg.room] = [];
    messages[msg.room].push(msg); io.to(msg.room).emit('chat message', msg);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Love Finder is running on port ${PORT}`));
