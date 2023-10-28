const express = require('express')
const ejs = require('ejs')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config()
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')
const port = 4001
var session = require('express-session')

app.set('view engine','ejs')
app.set('views','./views')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(session({secret:'keybord cat',cookie:{maxAge:6000},
resave:true, saveUninitialized:true}))
connection.query("SET time_zone='Asia/Seoul';")

app.use(function (req, res, next) {
  res.locals.user_id ="";
  res.locals.name ="";
  if(req.session.member){
    res.locals.user_id = req.session.member.user_id //모든페이지에서 세션에 있는 값을 적용가능
    res.locals.name = req.session.member.name
  }  
  next()  //다음으로 넘어가는 미들웨어
})

//라우팅
app.get('/', (req, res) => {
  // res.send('<h1>Hello World!</h1>')
  res.render('index')
})
app.get('/profile', (req, res) => {
  res.render('profile')
})
app.get('/map', (req, res) => {
  res.render('map')
})
app.get('/contact', (req, res) => {
  res.render('contact')
})
app.post('/contactProc', (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const memo = req.body.memo;

  // var a =`${name} ${name} ${name} ${name}`
  // res.send(a)
  var sql =`insert into contact(name,phone,email,memo,regdate)
  values(?,?,?,?,now())`
  var values =[name,phone,email,memo]
  connection.query(sql,values, function(err, result){
    if(err) throw err;
    console.log('자료 1개를 삽입했습니다.');
    res.send("<script>alert('문의사항이 등록되었습니다.');location.href='/'</script>")
  })
})

app.get('/contactList', (req, res) => {
  var idx = req.query.idx
  var sql =`select * from contact order by idx desc`
  connection.query(sql, function (err, results, fields){
    if(err) throw err;
    // console.log(results)
    res.render('contactList',{lists:results})
  })
  // res.render('contact') 
})

app.get('/contactDelete', (req, res) => {
  var idx = req.query.idx
  var sql = `delete from contact where idx ='${idx}'`
  connection.query(sql, function(err, result){
    if(err) throw err;
    res.send("<script>alert('삭제 되었습니다.');location.href='/contactList'</script>")
  })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/loginProc', (req, res) => {
  const user_id = req.body.user_id;
  const pw = req.body.pw;
  var sql =`select * from member where user_id=? and pw=?`
  var values =[user_id,pw]
  connection.query(sql,values, function(err, result){
    if(err) throw err;
    // console.log(result.length)   
    if(result.length==0){     // 0 -> 없다, 1 -> 있다
      res.send("<script>alert('없는 아이디입니다.');location.href='/login'</script>")
    }else{
      console.log(result[0])
      req.session.member = result[0]  //로그인에 성공한 사용자 인증상태유지, 식별정보를 세션에저장

      res.send("<script>alert('로그인 되었습니다.');location.href='/'</script>")
    }   
  })
})

app.get('/logout', (req, res) => {
  req.session.member = null;
  res.send("<script>alert('로그아웃 되었습니다.');location.href='/'</script>")
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})