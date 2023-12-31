import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';
import axios from "axios";
import { render } from "ejs";
import multer from "multer";
const port=3000;
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: 'public/assets/',
    filename: (req, file, cb) => {
      cb(null, file.fieldname+Date.now() +".png");
    }
  });
  
  const upload = multer({ storage: storage });
const db=new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "library",
    password: "gaurav",
    port: 5432,
});

db.connect((err)=>{
    if(err) throw err;  
    console.log("connected!");
});
async function getItems() {
    let items=[];
    const result=await db.query("select * from lib");
    
    result.rows.forEach(element => {
        items.push(element);
    });
    return items;
   }
   async function getItemsRa() {
    let items=[];
    const result=await db.query("select * from lib order by rating desc");

    result.rows.forEach(element => {
        items.push(element);
    });
    console.log(items);
    return items;
   }
   async function getItemsRc() {
    let items=[];
    const result=await db.query("select * from lib order by recency desc");
    
    result.rows.forEach(element => {
        items.push(element);
    });
    console.log(items);
    return items;
   }
app.get('/',async(req,res)=>{
    const result=await db.query("select * from lib");
    const item= await getItems();
    res.render("index.ejs",{
        items:item
    });
});
app.post('/delete',async (req,res)=>{
    await db.query("delete from lib where id=$1",[(req.body.deleteId)]);
    res.redirect('/');
})
app.post('/edit',async (req,res)=>{
    await db.query("update lib set para=$1 where id=$2",[req.body.updatedElementPara,req.body.updatedElementId]);
    res.redirect('/');
})
app.post('/sort',async(req,res)=>{
    let result1;
    if(req.body.sorting='recency'){
        result1=await getItemsRc();
    }else{
        result1=await getItemsRa();
    }

    res.render("index.ejs",{
    items:result1
});

});
app.post('/addR',upload.single("avatar"),async (req,res)=>{
    let path=(req.file.path).substring(7,(req.file.path).length);
  
    await db.query("insert into lib(title,author,rating,recency,para,img)values($1,$2,$3,$4,$5,$6)",
    [req.body.bookHeading,req.body.authorName,req.body.rating,req.body.racency,req.body.bookNotes,path]);
    console.log(req.file.path);
    console.log(req.body);   

   res.redirect('/');
})
app.post('/add',async(req,res)=>{
    res.render("new.ejs");
})
app.listen(port,()=>{
    console.log("the port is 3000");
})
