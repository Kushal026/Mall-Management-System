const fetch = globalThis.fetch || require('node-fetch');
async function login(email, password){
  try{
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  }catch(err){
    console.error('ERR', err.message);
  }
}
(async ()=>{
  await login('admin@smartmall.local','password');
  await login('anjali@mall.com','password123');
  await login('anjali@mall.com','password');
  await login('admin@smartmall.local','admin');
})();
